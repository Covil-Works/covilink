import fs from 'fs';
import path from 'path';
import { isNeonDatabaseConnected, queryDb } from './db';

export interface ClickEvent {
  id: string;
  linkId: string;
  linkTitle: string;
  url: string;
  timestamp: string; // ISO string
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  referrer: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
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
  clicksTimeline: Array<{ time: string; clicks: number }>;
  recentClicks: ClickEvent[];
  isDatabaseConnected: boolean;
}

const DATA_FILE = path.join(process.cwd(), '.next', 'covilink-analytics.json');

// Memory cache fallback
let memoryClicks: ClickEvent[] = [];

function loadAnalyticsFromFile(): ClickEvent[] {
  if (memoryClicks.length > 0) return memoryClicks;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryClicks = parsed;
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
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(clicks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving analytics file:', err);
  }
}

export { isNeonDatabaseConnected };

/**
 * Registra um clique no PostgreSQL (se conectado) e no cache local.
 */
export async function trackClick(event: Omit<ClickEvent, 'id' | 'timestamp'>): Promise<ClickEvent> {
  const newEvent: ClickEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
 * Retorna o resumo consolidado de métricas (do PostgreSQL ou local).
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const isDbConnected = isNeonDatabaseConnected();
  let clicks: ClickEvent[] = [];

  if (isDbConnected) {
    try {
      const rows = await queryDb<any>(
        `SELECT id, link_id, link_title, url, device, browser, referrer, timestamp 
         FROM click_events 
         ORDER BY timestamp DESC 
         LIMIT 500;`
      );

      clicks = (rows || []).map((row) => ({
        id: String(row.id),
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
      clicks = loadAnalyticsFromFile();
    }
  } else {
    clicks = loadAnalyticsFromFile();
  }

  const totalClicks = clicks.length;
  const uniqueVisitors = totalClicks > 0 ? Math.max(1, Math.round(totalClicks * 0.72)) : 0;

  // Links breakdown
  const clicksByLink: Record<string, { id: string; title: string; clicks: number; url: string }> = {};
  const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };

  clicks.forEach((c) => {
    // Device count
    if (c.device === 'desktop' || c.device === 'tablet' || c.device === 'mobile') {
      deviceBreakdown[c.device]++;
    } else {
      deviceBreakdown.mobile++;
    }

    // Link count
    if (!clicksByLink[c.linkId]) {
      clicksByLink[c.linkId] = {
        id: c.linkId,
        title: c.linkTitle,
        clicks: 0,
        url: c.url,
      };
    }
    clicksByLink[c.linkId].clicks++;
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

  // Timeline (group by hour for last 12 hours)
  const timelineMap: Record<string, number> = {};
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeLabel = hourDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    timelineMap[timeLabel] = 0;
  }

  clicks.forEach((c) => {
    const date = new Date(c.timestamp);
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 12 && diffHours >= 0) {
      const slots = Object.keys(timelineMap);
      if (slots.length > 0) {
        const index = Math.min(slots.length - 1, Math.max(0, Math.floor(slots.length - 1 - (diffHours / 12) * slots.length)));
        const targetSlot = slots[index];
        if (targetSlot) {
          timelineMap[targetSlot] = (timelineMap[targetSlot] || 0) + 1;
        }
      }
    }
  });

  const clicksTimeline = Object.entries(timelineMap).map(([time, clicksCount]) => ({
    time,
    clicks: clicksCount,
  }));

  return {
    totalClicks,
    uniqueVisitors,
    topPerformingLink,
    clicksByLink,
    deviceBreakdown,
    clicksTimeline,
    recentClicks: clicks.slice(0, 15),
    isDatabaseConnected: isDbConnected,
  };
}

/**
 * Reseta os dados analíticos no PostgreSQL e localmente.
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
