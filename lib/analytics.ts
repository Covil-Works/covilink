import fs from 'fs';
import path from 'path';
import { isNeonDatabaseConnected, queryDb } from './db';

export type AnalyticsEventType = 'click' | 'pageview';
export type TimePeriod = 'today' | '7d' | '30d' | 'all';

export interface ClickEvent {
  id: string;
  type?: AnalyticsEventType;
  linkId: string;
  linkTitle: string;
  url: string;
  timestamp: string; // ISO string
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  referrer: string;
  visitorId?: string;
}

export interface ReferrerStat {
  name: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  period: TimePeriod;
  totalClicks: number;
  totalPageViews: number;
  ctr: number; // Click-through rate in percentage (e.g. 18.5)
  uniqueVisitors: number;
  topPerformingLink: {
    id: string;
    title: string;
    clicks: number;
  } | null;
  clicksByLink: Record<string, { id: string; title: string; clicks: number; url: string }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  referrersBreakdown: ReferrerStat[];
  clicksTimeline: Array<{ time: string; clicks: number }>;
  recentClicks: ClickEvent[];
  isDatabaseConnected: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'covilink-analytics.json');
const LEGACY_DATA_FILE = path.join(process.cwd(), '.next', 'covilink-analytics.json');

// Memory cache fallback
let memoryClicks: ClickEvent[] = [];

/**
 * Normaliza e agrupa o referenciador em canais conhecidos (Instagram, TikTok, Direto, etc.)
 */
export function cleanReferrer(ref?: string): string {
  if (!ref || ref.trim() === '' || ref === 'Direto / Rede Social' || ref === 'Direto') {
    return 'Direto';
  }
  const lower = ref.toLowerCase();
  if (lower.includes('instagram') || lower.includes('cdninstagram')) return 'Instagram';
  if (lower.includes('tiktok') || lower.includes('musically') || lower.includes('musical.ly') || lower.includes('bytedance')) return 'TikTok';
  if (lower.includes('twitter') || lower.includes('t.co') || lower.includes('x.com')) return 'X (Twitter)';
  if (lower.includes('whatsapp') || lower.includes('wa.me')) return 'WhatsApp';
  if (lower.includes('youtube') || lower.includes('youtu.be')) return 'YouTube';
  if (lower.includes('facebook') || lower.includes('fb.com') || lower.includes('fb.me') || lower.includes('messenger')) return 'Facebook';
  if (lower.includes('linkedin') || lower.includes('lnkd.in')) return 'LinkedIn';
  if (lower.includes('threads.net')) return 'Threads';
  if (lower.includes('google') || lower.includes('bing') || lower.includes('duckduckgo') || lower.includes('yahoo')) return 'Google / Busca';
  if (lower.includes('telegram') || lower.includes('t.me')) return 'Telegram';
  if (lower.includes('discord')) return 'Discord';
  if (lower.includes('pinterest')) return 'Pinterest';

  try {
    const url = new URL(ref);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Outros';
  }
}

function loadAnalyticsFromFile(): ClickEvent[] {
  if (memoryClicks.length > 0) return memoryClicks;
  try {
    let targetFile = DATA_FILE;
    if (!fs.existsSync(DATA_FILE) && fs.existsSync(LEGACY_DATA_FILE)) {
      targetFile = LEGACY_DATA_FILE;
    }

    if (fs.existsSync(targetFile)) {
      const content = fs.readFileSync(targetFile, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryClicks = parsed;
        // Se foi lido do legado, migra de forma atômica para data/
        if (targetFile === LEGACY_DATA_FILE) {
          saveAnalyticsToFile(memoryClicks);
        }
        return memoryClicks;
      }
    }
  } catch (err) {
    console.error('Error reading analytics file:', err);
  }
  memoryClicks = [];
  return memoryClicks;
}

function saveAnalyticsToFile(clicks: ClickEvent[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.${Date.now()}-${Math.random().toString(36).substring(2, 6)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(clicks, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Error saving analytics file:', err);
  }
}

export { isNeonDatabaseConnected };

/**
 * Registra um evento analítico (clique ou pageview) no PostgreSQL (se conectado) e no cache local.
 */
export async function trackClick(event: Omit<ClickEvent, 'id' | 'timestamp'> & { type?: AnalyticsEventType }): Promise<ClickEvent> {
  const newEvent: ClickEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: event.type || (event.linkId === 'pageview' ? 'pageview' : 'click'),
    timestamp: new Date().toISOString(),
    ...event,
  };

  if (isNeonDatabaseConnected()) {
    try {
      await queryDb(
        `INSERT INTO click_events (
          id, link_id, link_title, url, device, browser, referrer, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          newEvent.id,
          newEvent.linkId,
          newEvent.linkTitle,
          newEvent.url,
          newEvent.device,
          newEvent.browser,
          newEvent.referrer,
          newEvent.timestamp,
        ]
      );
    } catch (dbError) {
      console.error('[DB] Error inserting click_event to database:', dbError);
    }
  }

  const clicks = loadAnalyticsFromFile();
  clicks.unshift(newEvent);
  memoryClicks = clicks;
  saveAnalyticsToFile(clicks);

  return newEvent;
}

/**
 * Filtra eventos de acordo com a janela de tempo selecionada.
 */
function filterEventsByPeriod(events: ClickEvent[], period: TimePeriod): ClickEvent[] {
  if (period === 'all') return events;

  const now = Date.now();
  let msAgo = 7 * 24 * 60 * 60 * 1000; // default 7 days

  if (period === 'today') {
    msAgo = 24 * 60 * 60 * 1000;
  } else if (period === '7d') {
    msAgo = 7 * 24 * 60 * 60 * 1000;
  } else if (period === '30d') {
    msAgo = 30 * 24 * 60 * 60 * 1000;
  }

  const threshold = now - msAgo;

  return events.filter((e) => {
    const time = new Date(e.timestamp).getTime();
    return !isNaN(time) && time >= threshold;
  });
}

/**
 * Retorna o resumo consolidado de métricas (do PostgreSQL ou local), com filtro de período.
 */
export async function getAnalyticsSummary(period: TimePeriod = '7d'): Promise<AnalyticsSummary> {
  const isDbConnected = isNeonDatabaseConnected();
  let allEvents: ClickEvent[] = [];

  if (isDbConnected) {
    try {
      const rows = await queryDb<any>(
        `SELECT id, link_id, link_title, url, device, browser, referrer, timestamp 
         FROM click_events 
         ORDER BY timestamp DESC 
         LIMIT 2000;`
      );

      allEvents = (rows || []).map((row) => ({
        id: String(row.id),
        type: row.link_id === 'pageview' ? ('pageview' as const) : ('click' as const),
        linkId: String(row.link_id),
        linkTitle: String(row.link_title || row.link_id),
        url: String(row.url || ''),
        timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : new Date().toISOString(),
        device: (row.device === 'desktop' || row.device === 'tablet') ? row.device : 'mobile',
        browser: String(row.browser || 'Chrome'),
        referrer: String(row.referrer || 'Direto'),
      }));
    } catch (dbError) {
      console.error('[DB] Error fetching click_events from database:', dbError);
      allEvents = loadAnalyticsFromFile();
    }
  } else {
    allEvents = loadAnalyticsFromFile();
  }

  // Filtragem por período
  const filteredEvents = filterEventsByPeriod(allEvents, period);

  // Separação de cliques reais e pageviews
  const clickEvents = filteredEvents.filter((e) => e.type !== 'pageview' && e.linkId !== 'pageview');
  const pageViewEvents = filteredEvents.filter((e) => e.type === 'pageview' || e.linkId === 'pageview');

  const totalClicks = clickEvents.length;
  const totalPageViews = pageViewEvents.length;

  // CTR Real: Cliques / Visualizações
  const ctr = totalPageViews > 0
    ? Math.min(100, Math.round((totalClicks / totalPageViews) * 1000) / 10)
    : (totalClicks > 0 ? 100 : 0);

  // Cálculo de Visitantes Únicos (baseado em sessões/combinação ou proporção real de eventos)
  const uniqueVisitorKeys = new Set<string>();
  filteredEvents.forEach((e) => {
    if (e.visitorId) {
      uniqueVisitorKeys.add(e.visitorId);
    } else {
      // Cria uma chave de sessão aproximada por data + dispositivo + navegador
      const dayKey = e.timestamp.slice(0, 10);
      uniqueVisitorKeys.add(`${dayKey}-${e.device}-${e.browser}`);
    }
  });

  const uniqueVisitors = uniqueVisitorKeys.size > 0
    ? uniqueVisitorKeys.size
    : (filteredEvents.length > 0 ? Math.max(1, Math.round(filteredEvents.length * 0.72)) : 0);

  // Links breakdown
  const clicksByLink: Record<string, { id: string; title: string; clicks: number; url: string }> = {};
  const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
  const referrersCount: Record<string, number> = {};

  filteredEvents.forEach((c) => {
    // Device count
    if (c.device === 'desktop' || c.device === 'tablet' || c.device === 'mobile') {
      deviceBreakdown[c.device]++;
    } else {
      deviceBreakdown.mobile++;
    }

    // Referrers grouping
    const refChannel = cleanReferrer(c.referrer);
    referrersCount[refChannel] = (referrersCount[refChannel] || 0) + 1;

    // Clicks by link (apenas cliques reais)
    if (c.type !== 'pageview' && c.linkId !== 'pageview') {
      if (!clicksByLink[c.linkId]) {
        clicksByLink[c.linkId] = {
          id: c.linkId,
          title: c.linkTitle,
          clicks: 0,
          url: c.url,
        };
      }
      clicksByLink[c.linkId].clicks++;
    }
  });

  // Top performing link
  let topPerformingLink: AnalyticsSummary['topPerformingLink'] = null;
  let maxClicks = -1;

  Object.values(clicksByLink).forEach((item) => {
    if (item.clicks > maxClicks) {
      maxClicks = item.clicks;
      topPerformingLink = {
        id: item.id,
        title: item.title,
        clicks: item.clicks,
      };
    }
  });

  // Referrers Breakdown Ordenado
  const totalEventsForReferrer = filteredEvents.length;
  const referrersBreakdown: ReferrerStat[] = Object.entries(referrersCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalEventsForReferrer > 0 ? Math.round((count / totalEventsForReferrer) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Timeline adaptada para o período selecionado
  const now = new Date();
  const timelineMap: Record<string, number> = {};

  if (period === 'today') {
    // 8 slots de 3 horas para as últimas 24 horas
    for (let i = 7; i >= 0; i--) {
      const slotTime = new Date(now.getTime() - i * 3 * 60 * 60 * 1000);
      const label = `${String(slotTime.getHours()).padStart(2, '0')}h`;
      timelineMap[label] = 0;
    }

    clickEvents.forEach((c) => {
      const date = new Date(c.timestamp);
      const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      if (diffHours >= 0 && diffHours <= 24) {
        const slots = Object.keys(timelineMap);
        const index = Math.min(slots.length - 1, Math.max(0, Math.floor(slots.length - 1 - (diffHours / 24) * slots.length)));
        const targetSlot = slots[index];
        if (targetSlot) {
          timelineMap[targetSlot] = (timelineMap[targetSlot] || 0) + 1;
        }
      }
    });
  } else if (period === '7d') {
    // 7 slots diários para os últimos 7 dias
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const slotDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = `${weekDays[slotDate.getDay()]} (${String(slotDate.getDate()).padStart(2, '0')}/${String(slotDate.getMonth() + 1).padStart(2, '0')})`;
      timelineMap[label] = 0;
    }

    clickEvents.forEach((c) => {
      const date = new Date(c.timestamp);
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= 7) {
        const slots = Object.keys(timelineMap);
        const index = Math.min(slots.length - 1, Math.max(0, Math.floor(slots.length - 1 - (diffDays / 7) * slots.length)));
        const targetSlot = slots[index];
        if (targetSlot) {
          timelineMap[targetSlot] = (timelineMap[targetSlot] || 0) + 1;
        }
      }
    });
  } else {
    // 30d ou all: 6 intervalos
    const intervalCount = 6;
    const totalDays = period === '30d' ? 30 : 60;
    for (let i = intervalCount - 1; i >= 0; i--) {
      const slotDate = new Date(now.getTime() - (i * (totalDays / intervalCount)) * 24 * 60 * 60 * 1000);
      const label = `${String(slotDate.getDate()).padStart(2, '0')}/${String(slotDate.getMonth() + 1).padStart(2, '0')}`;
      timelineMap[label] = 0;
    }

    clickEvents.forEach((c) => {
      const date = new Date(c.timestamp);
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= totalDays) {
        const slots = Object.keys(timelineMap);
        const index = Math.min(slots.length - 1, Math.max(0, Math.floor(slots.length - 1 - (diffDays / totalDays) * slots.length)));
        const targetSlot = slots[index];
        if (targetSlot) {
          timelineMap[targetSlot] = (timelineMap[targetSlot] || 0) + 1;
        }
      }
    });
  }

  const clicksTimeline = Object.entries(timelineMap).map(([time, clicksCount]) => ({
    time,
    clicks: clicksCount,
  }));

  return {
    period,
    totalClicks,
    totalPageViews,
    ctr,
    uniqueVisitors,
    topPerformingLink,
    clicksByLink,
    deviceBreakdown,
    referrersBreakdown,
    clicksTimeline,
    recentClicks: clickEvents.slice(0, 15),
    isDatabaseConnected: isDbConnected,
  };
}

/**
 * Reseta todos os dados analíticos no PostgreSQL e no armazenamento local seguro.
 */
export async function resetAnalyticsData(): Promise<void> {
  if (isNeonDatabaseConnected()) {
    try {
      await queryDb('DELETE FROM click_events;');
    } catch (dbError) {
      console.error('[DB] Error clearing click_events table:', dbError);
    }
  }

  memoryClicks = [];
  saveAnalyticsToFile(memoryClicks);
}
