import fs from 'fs';
import path from 'path';
import { isNeonDatabaseConnected, queryDb } from './db';

export type AnalyticsEventType = 'click' | 'pageview' | 'scroll_depth' | 'blur_reveal' | 'dwell_time';
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
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  scrollDepth?: number;
  dwellSeconds?: number;
}

export interface ReferrerStat {
  name: string;
  count: number;
  percentage: number;
}

export interface ScrollDepthStage {
  count: number;
  percentage: number;
}

export interface ScrollDepthSummary {
  depth25: ScrollDepthStage;
  depth50: ScrollDepthStage;
  depth75: ScrollDepthStage;
  depth100: ScrollDepthStage;
  dropOffRate: number; // % who left before reaching the footer
}

export interface BlurCardStat {
  id: string;
  title: string;
  reveals: number;
  clicks: number;
  conversionRate: number; // (clicks / reveals) * 100
}

export interface BlurEngagementSummary {
  totalReveals: number;
  revealRate: number; // % of pageviews that revealed blurred content
  cardsBreakdown: BlurCardStat[];
}

export interface DwellTimeDistributionBucket {
  count: number;
  percentage: number;
  label: string;
}

export interface DwellTimeSummary {
  averageSeconds: number;
  formattedAverage: string;
  distribution: {
    quick: DwellTimeDistributionBucket; // < 5s
    medium: DwellTimeDistributionBucket; // 5-20s
    deep: DwellTimeDistributionBucket; // > 20s
  };
}

export interface GeoStat {
  name: string;
  count: number;
  percentage: number;
}

export interface LanguageStat {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

export interface HeatmapBestTime {
  dayIndex: number;
  dayName: string;
  hour: number;
  hourLabel: string;
  count: number;
  recommendation: string;
}

export interface HeatmapSummary {
  matrix: number[][]; // 7 rows (0=Dom, 1=Seg, ..., 6=Sáb), 24 cols (0h-23h)
  maxCount: number;
  bestTimes: HeatmapBestTime[];
}

export interface SpikeAlert {
  linkId: string;
  linkTitle: string;
  recentClicks: number;
  baselineHourlyClicks: number;
  increasePercentage: number;
  detectedAt: string;
  message: string;
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

  // Features "PRA AGORA":
  scrollDepth: ScrollDepthSummary;
  blurEngagement: BlurEngagementSummary;
  dwellTime: DwellTimeSummary;
  geoCountries: GeoStat[];
  geoRegions: GeoStat[];
  languages: LanguageStat[];
  heatmap: HeatmapSummary;
  spikes: SpikeAlert[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'covilink-analytics.json');
const LEGACY_DATA_FILE = path.join(process.cwd(), '.next', 'covilink-analytics.json');

// Memory cache fallback
let memoryClicks: ClickEvent[] = [];
let dbSchemaEnsured = false;

/**
 * Garante que a tabela click_events possua todas as colunas necessárias para as métricas avançadas.
 */
async function ensureDbSchema(): Promise<void> {
  if (dbSchemaEnsured || !isNeonDatabaseConnected()) return;
  try {
    await queryDb(`
      ALTER TABLE click_events ADD COLUMN IF NOT EXISTS event_type VARCHAR(32) DEFAULT 'click';
      ALTER TABLE click_events ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(64) DEFAULT '';
      ALTER TABLE click_events ADD COLUMN IF NOT EXISTS country VARCHAR(64) DEFAULT '';
      ALTER TABLE click_events ADD COLUMN IF NOT EXISTS region VARCHAR(64) DEFAULT '';
      ALTER TABLE click_events ADD COLUMN IF NOT EXISTS language VARCHAR(32) DEFAULT '';
      ALTER TABLE click_events ADD COLUMN IF NOT EXISTS scroll_depth INT DEFAULT 0;
      ALTER TABLE click_events ADD COLUMN IF NOT EXISTS dwell_seconds INT DEFAULT 0;
      CREATE INDEX IF NOT EXISTS idx_click_events_type ON click_events(event_type);
    `);
    dbSchemaEnsured = true;
  } catch (err) {
    // Ignora erros de permissão ou migração concorrente
    console.warn('[DB] ensureDbSchema warning:', err);
  }
}

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
 * Registra um evento analítico (clique, pageview, scroll, blur ou dwell) no PostgreSQL e no cache local.
 */
export async function trackClick(event: Omit<ClickEvent, 'id' | 'timestamp'> & { type?: AnalyticsEventType }): Promise<ClickEvent> {
  const eventType: AnalyticsEventType = event.type || (event.linkId === 'pageview' ? 'pageview' : 'click');
  const newEvent: ClickEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: eventType,
    timestamp: new Date().toISOString(),
    country: event.country || 'Brasil',
    region: event.region || 'São Paulo (SP)',
    language: event.language || 'Português (Brasil)',
    scrollDepth: typeof event.scrollDepth === 'number' ? event.scrollDepth : 0,
    dwellSeconds: typeof event.dwellSeconds === 'number' ? event.dwellSeconds : 0,
    ...event,
  };

  if (isNeonDatabaseConnected()) {
    try {
      await ensureDbSchema();
      await queryDb(
        `INSERT INTO click_events (
          id, link_id, link_title, url, device, browser, referrer, timestamp,
          event_type, visitor_id, country, region, language, scroll_depth, dwell_seconds
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`,
        [
          newEvent.id,
          newEvent.linkId,
          newEvent.linkTitle,
          newEvent.url,
          newEvent.device,
          newEvent.browser,
          newEvent.referrer,
          newEvent.timestamp,
          newEvent.type,
          newEvent.visitorId || '',
          newEvent.country || '',
          newEvent.region || '',
          newEvent.language || '',
          newEvent.scrollDepth || 0,
          newEvent.dwellSeconds || 0,
        ]
      );
    } catch (dbError) {
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
      } catch (fallbackErr) {
        console.error('[DB] Error inserting click_event fallback:', fallbackErr);
      }
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
 * Formata segundos de permanência em texto amigável (ex: "18s", "1m 24s").
 */
export function formatDwellDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const remSecs = Math.round(seconds % 60);
  return remSecs > 0 ? `${mins}m ${remSecs}s` : `${mins}m`;
}

/**
 * Detecta picos anômalos de cliques em links ("Link em Alta").
 */
export function detectSpikes(allEvents: ClickEvent[]): SpikeAlert[] {
  const now = Date.now();
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const recentThreshold = now - twoHoursMs;
  const baselineThreshold = now - 48 * 60 * 60 * 1000;

  // Separa cliques reais
  const linkClicks = allEvents.filter(
    (e) => (e.type === 'click' || !e.type) && e.linkId !== 'pageview' && !e.linkId.startsWith('scroll-')
  );

  const recentCounts: Record<string, { count: number; title: string }> = {};
  const baselineCounts: Record<string, number> = {};

  linkClicks.forEach((e) => {
    const time = new Date(e.timestamp).getTime();
    if (isNaN(time)) return;

    if (time >= recentThreshold) {
      if (!recentCounts[e.linkId]) {
        recentCounts[e.linkId] = { count: 0, title: e.linkTitle };
      }
      recentCounts[e.linkId].count++;
    } else if (time >= baselineThreshold) {
      baselineCounts[e.linkId] = (baselineCounts[e.linkId] || 0) + 1;
    }
  });

  const alerts: SpikeAlert[] = [];

  Object.entries(recentCounts).forEach(([linkId, { count: recentClicks, title }]) => {
    // Mínimo de 3 cliques recentes para evitar alarmes falsos de 1 ou 2 cliques
    if (recentClicks < 3) return;

    const baseTotal = baselineCounts[linkId] || 0;
    // Janela base de 46 horas (48h - 2h recentes)
    const baseHourly = baseTotal / 46;
    const recentHourly = recentClicks / 2;

    let increasePct = 0;
    let isSpike = false;

    if (baseHourly === 0) {
      // Link não tinha cliques nas últimas 46h e subitamente teve >= 3 cliques em 2h
      increasePct = Math.round(recentClicks * 100);
      isSpike = true;
    } else if (recentHourly >= 2.0 * baseHourly) {
      // Pelo menos 100% de aumento sobre a média móvel
      increasePct = Math.round(((recentHourly - baseHourly) / baseHourly) * 100);
      isSpike = true;
    }

    if (isSpike) {
      alerts.push({
        linkId,
        linkTitle: title,
        recentClicks,
        baselineHourlyClicks: Math.round(baseHourly * 10) / 10,
        increasePercentage: increasePct,
        detectedAt: new Date().toISOString(),
        message: `O link "${title}" registrou um salto atípico de +${increasePct}% de cliques nas últimas 2 horas (${recentClicks} cliques recentes). Potencial de viralização detectado!`,
      });
    }
  });

  return alerts.sort((a, b) => b.increasePercentage - a.increasePercentage);
}

/**
 * Retorna o resumo consolidado de métricas (do PostgreSQL ou local), com suporte completo
 * para comportamento, funil de atenção, demografia anônima, heatmap e spike detection.
 */
export async function getAnalyticsSummary(period: TimePeriod = '7d'): Promise<AnalyticsSummary> {
  const isDbConnected = isNeonDatabaseConnected();
  let allEvents: ClickEvent[] = [];

  if (isDbConnected) {
    try {
      await ensureDbSchema();
      const rows = await queryDb<any>(
        `SELECT id, link_id, link_title, url, device, browser, referrer, timestamp,
                event_type, visitor_id, country, region, language, scroll_depth, dwell_seconds 
         FROM click_events 
         ORDER BY timestamp DESC 
         LIMIT 3000;`
      );

      allEvents = (rows || []).map((row) => ({
        id: String(row.id),
        type: (row.event_type || (row.link_id === 'pageview' ? 'pageview' : 'click')) as AnalyticsEventType,
        linkId: String(row.link_id),
        linkTitle: String(row.link_title || row.link_id),
        url: String(row.url || ''),
        timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : new Date().toISOString(),
        device: (row.device === 'desktop' || row.device === 'tablet') ? row.device : 'mobile',
        browser: String(row.browser || 'Chrome'),
        referrer: String(row.referrer || 'Direto'),
        visitorId: row.visitor_id ? String(row.visitor_id) : undefined,
        country: row.country ? String(row.country) : undefined,
        region: row.region ? String(row.region) : undefined,
        language: row.language ? String(row.language) : undefined,
        scrollDepth: typeof row.scroll_depth === 'number' ? row.scroll_depth : undefined,
        dwellSeconds: typeof row.dwell_seconds === 'number' ? row.dwell_seconds : undefined,
      }));
    } catch (dbError) {
      try {
        const rows = await queryDb<any>(
          `SELECT id, link_id, link_title, url, device, browser, referrer, timestamp 
           FROM click_events 
           ORDER BY timestamp DESC 
           LIMIT 3000;`
        );
        allEvents = (rows || []).map((row) => ({
          id: String(row.id),
          type: (row.link_id === 'pageview' ? 'pageview' : 'click') as AnalyticsEventType,
          linkId: String(row.link_id),
          linkTitle: String(row.link_title || row.link_id),
          url: String(row.url || ''),
          timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : new Date().toISOString(),
          device: (row.device === 'desktop' || row.device === 'tablet') ? row.device : 'mobile',
          browser: String(row.browser || 'Chrome'),
          referrer: String(row.referrer || 'Direto'),
        }));
      } catch {
        allEvents = loadAnalyticsFromFile();
      }
    }
  } else {
    allEvents = loadAnalyticsFromFile();
  }

  // Filtragem por período
  const filteredEvents = filterEventsByPeriod(allEvents, period);

  // Separação de tipos de eventos
  const clickEvents = filteredEvents.filter(
    (e) => (e.type === 'click' || !e.type) && e.linkId !== 'pageview' && !e.linkId.startsWith('scroll-')
  );
  const pageViewEvents = filteredEvents.filter((e) => e.type === 'pageview' || e.linkId === 'pageview');
  const blurEvents = filteredEvents.filter((e) => e.type === 'blur_reveal');
  const scrollEvents = filteredEvents.filter((e) => e.type === 'scroll_depth' || (typeof e.scrollDepth === 'number' && e.scrollDepth > 0));
  const dwellEvents = filteredEvents.filter((e) => e.type === 'dwell_time' || (typeof e.dwellSeconds === 'number' && e.dwellSeconds > 0));

  const totalClicks = clickEvents.length;
  const totalPageViews = pageViewEvents.length;

  // CTR Real: Cliques / Visualizações
  const ctr = totalPageViews > 0
    ? Math.min(100, Math.round((totalClicks / totalPageViews) * 1000) / 10)
    : (totalClicks > 0 ? 100 : 0);

  // Cálculo de Visitantes Únicos
  const uniqueVisitorKeys = new Set<string>();
  filteredEvents.forEach((e) => {
    if (e.visitorId) {
      uniqueVisitorKeys.add(e.visitorId);
    } else {
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
    if ((c.type === 'click' || !c.type) && c.linkId !== 'pageview' && !c.linkId.startsWith('scroll-')) {
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

  // ==============================================================================
  // RECURSOS PRA AGORA:
  // ==============================================================================

  // 1. Profundidade de Rolagem (Scroll Depth & Drop-off Rate)
  const visitorMaxDepth = new Map<string, number>();
  scrollEvents.forEach((e) => {
    const key = e.visitorId || `${e.timestamp.slice(0, 10)}-${e.device}-${e.browser}`;
    const depth = typeof e.scrollDepth === 'number' ? e.scrollDepth : 0;
    const prev = visitorMaxDepth.get(key) || 0;
    if (depth > prev) visitorMaxDepth.set(key, depth);
  });

  let count25 = 0;
  let count50 = 0;
  let count75 = 0;
  let count100 = 0;

  visitorMaxDepth.forEach((depth) => {
    if (depth >= 25) count25++;
    if (depth >= 50) count50++;
    if (depth >= 75) count75++;
    if (depth >= 100) count100++;
  });

  const baseVisitorsForScroll = Math.max(1, uniqueVisitors || totalPageViews || visitorMaxDepth.size || 1);
  const scrollDepth: ScrollDepthSummary = {
    depth25: {
      count: count25,
      percentage: Math.min(100, Math.round((count25 / baseVisitorsForScroll) * 100)),
    },
    depth50: {
      count: count50,
      percentage: Math.min(100, Math.round((count50 / baseVisitorsForScroll) * 100)),
    },
    depth75: {
      count: count75,
      percentage: Math.min(100, Math.round((count75 / baseVisitorsForScroll) * 100)),
    },
    depth100: {
      count: count100,
      percentage: Math.min(100, Math.round((count100 / baseVisitorsForScroll) * 100)),
    },
    dropOffRate: Math.max(0, 100 - Math.min(100, Math.round((count100 / baseVisitorsForScroll) * 100))),
  };

  // 2. Métrica de Engajamento com Conteúdo Borrado (Blur Reveal Rate)
  const blurRevealsByCard: Record<string, { id: string; title: string; count: number }> = {};
  blurEvents.forEach((e) => {
    if (!blurRevealsByCard[e.linkId]) {
      blurRevealsByCard[e.linkId] = {
        id: e.linkId,
        title: e.linkTitle,
        count: 0,
      };
    }
    blurRevealsByCard[e.linkId].count++;
  });

  const totalBlurReveals = blurEvents.length;
  const overallRevealRate = totalPageViews > 0
    ? Math.min(100, Math.round((totalBlurReveals / totalPageViews) * 100))
    : (totalBlurReveals > 0 ? 100 : 0);

  const cardsBreakdown: BlurCardStat[] = Object.values(blurRevealsByCard).map((item) => {
    const directClicks = clicksByLink[item.id]?.clicks || 0;
    const conversionRate = item.count > 0 ? Math.min(100, Math.round((directClicks / item.count) * 100)) : 0;
    return {
      id: item.id,
      title: item.title,
      reveals: item.count,
      clicks: directClicks,
      conversionRate,
    };
  }).sort((a, b) => b.reveals - a.reveals);

  const blurEngagement: BlurEngagementSummary = {
    totalReveals: totalBlurReveals,
    revealRate: overallRevealRate,
    cardsBreakdown,
  };

  // 3. Tempo Médio de Permanência (Dwell Time)
  const visitorDwellMap = new Map<string, number>();
  dwellEvents.forEach((e) => {
    const key = e.visitorId || `${e.timestamp.slice(0, 10)}-${e.device}-${e.browser}`;
    const seconds = Math.min(600, Math.max(0, e.dwellSeconds || 0)); // cap em 10 min
    const prev = visitorDwellMap.get(key) || 0;
    if (seconds > prev) visitorDwellMap.set(key, seconds);
  });

  const dwellValues = Array.from(visitorDwellMap.values()).filter((s) => s > 0);
  const totalDwellSeconds = dwellValues.reduce((acc, curr) => acc + curr, 0);
  const averageSeconds = dwellValues.length > 0 ? Math.round(totalDwellSeconds / dwellValues.length) : 0;

  let quickCount = 0;
  let mediumCount = 0;
  let deepCount = 0;

  dwellValues.forEach((s) => {
    if (s < 5) quickCount++;
    else if (s <= 20) mediumCount++;
    else deepCount++;
  });

  const totalDwellRecorded = Math.max(1, dwellValues.length);
  const dwellTime: DwellTimeSummary = {
    averageSeconds,
    formattedAverage: formatDwellDuration(averageSeconds),
    distribution: {
      quick: {
        count: quickCount,
        percentage: dwellValues.length > 0 ? Math.round((quickCount / totalDwellRecorded) * 100) : 0,
        label: 'Decisão Rápida (< 5s)',
      },
      medium: {
        count: mediumCount,
        percentage: dwellValues.length > 0 ? Math.round((mediumCount / totalDwellRecorded) * 100) : 0,
        label: 'Navegação Moderada (5s - 20s)',
      },
      deep: {
        count: deepCount,
        percentage: dwellValues.length > 0 ? Math.round((deepCount / totalDwellRecorded) * 100) : 0,
        label: 'Exploração Detalhada (> 20s)',
      },
    },
  };

  // 4. Audiência e Demografia Anônima (Origem Geográfica & Idioma)
  const countryCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};
  const languageCounts: Record<string, { name: string; count: number }> = {};

  filteredEvents.forEach((e) => {
    // Country
    const c = e.country && e.country.trim() !== '' ? e.country : 'Brasil';
    countryCounts[c] = (countryCounts[c] || 0) + 1;

    // Region / State
    const r = e.region && e.region.trim() !== '' ? e.region : 'São Paulo (SP)';
    regionCounts[r] = (regionCounts[r] || 0) + 1;

    // Language
    const langRaw = e.language && e.language.trim() !== '' ? e.language : 'pt-BR';
    const langKey = langRaw.toLowerCase().startsWith('pt')
      ? 'pt-BR'
      : langRaw.toLowerCase().startsWith('en')
      ? 'en-US'
      : langRaw.toLowerCase().startsWith('es')
      ? 'es'
      : langRaw;
    const langName = langKey === 'pt-BR'
      ? 'Português (Brasil)'
      : langKey === 'en-US'
      ? 'Inglês'
      : langKey === 'es'
      ? 'Espanhol'
      : langRaw;

    if (!languageCounts[langKey]) {
      languageCounts[langKey] = { name: langName, count: 0 };
    }
    languageCounts[langKey].count++;
  });

  const totalEventsForDemographics = Math.max(1, filteredEvents.length);
  const geoCountries: GeoStat[] = Object.entries(countryCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalEventsForDemographics) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const geoRegions: GeoStat[] = Object.entries(regionCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalEventsForDemographics) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const languages: LanguageStat[] = Object.entries(languageCounts)
    .map(([code, { name, count }]) => ({
      code,
      name,
      count,
      percentage: Math.round((count / totalEventsForDemographics) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 5. Mapa de Calor de Horários (Heatmap 7x24 & Melhores Momentos)
  const heatmapMatrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const weekDayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  filteredEvents.forEach((e) => {
    const d = new Date(e.timestamp);
    if (!isNaN(d.getTime())) {
      const day = d.getDay();
      const hour = d.getHours();
      if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
        heatmapMatrix[day][hour]++;
      }
    }
  });

  let maxHeatmapCount = 0;
  const cellRank: Array<{ day: number; hour: number; count: number }> = [];

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const c = heatmapMatrix[d][h];
      if (c > maxHeatmapCount) maxHeatmapCount = c;
      if (c > 0) cellRank.push({ day: d, hour: h, count: c });
    }
  }

  cellRank.sort((a, b) => b.count - a.count);

  let bestTimes: HeatmapBestTime[] = [];
  if (cellRank.length > 0) {
    bestTimes = cellRank.slice(0, 3).map((item) => ({
      dayIndex: item.day,
      dayName: weekDayNames[item.day],
      hour: item.hour,
      hourLabel: `${String(item.hour).padStart(2, '0')}:00`,
      count: item.count,
      recommendation: `${weekDayNames[item.day]} às ${String(item.hour).padStart(2, '0')}h (${item.count} acessos registrados). Período de alto tráfego para postar stories e novos links.`,
    }));
  } else {
    // Sugestões inteligentes padrão baseadas em engajamento típico de redes sociais
    bestTimes = [
      {
        dayIndex: 2,
        dayName: 'Terça',
        hour: 19,
        hourLabel: '19:00',
        count: 0,
        recommendation: 'Terça-feira às 19h. Momento com alto engajamento em stories.',
      },
      {
        dayIndex: 4,
        dayName: 'Quinta',
        hour: 20,
        hourLabel: '20:00',
        count: 0,
        recommendation: 'Quinta-feira às 20h. Pico de transição de fim de expediente.',
      },
      {
        dayIndex: 0,
        dayName: 'Domingo',
        hour: 21,
        hourLabel: '21:00',
        count: 0,
        recommendation: 'Domingo às 21h. Maior tempo de tela no mobile antes da semana.',
      },
    ];
  }

  const heatmap: HeatmapSummary = {
    matrix: heatmapMatrix,
    maxCount: maxHeatmapCount,
    bestTimes,
  };

  // 6. Alertas de "Link em Alta" (Spike Detection)
  const spikes = detectSpikes(allEvents);

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

    scrollDepth,
    blurEngagement,
    dwellTime,
    geoCountries,
    geoRegions,
    languages,
    heatmap,
    spikes,
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
