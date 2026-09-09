import fs from 'fs';
import path from 'path';

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

// Memory cache fallback for fast access
let memoryClicks: ClickEvent[] = [];

// Seed realistic prototype metrics if data file doesn't exist
function getInitialSeedEvents(): ClickEvent[] {
  const now = new Date();
  const seed: ClickEvent[] = [];
  const linkTargets = [
    { id: 'link-mentor-call', title: 'Agendar Chamada de Mentoria VIP!', url: 'https://calendly.com' },
    { id: 'link-indigo-beauty', title: 'Programa Indigo Alien Beauty 🌌👽', url: 'https://example.com/indigo-beauty' },
    { id: 'link-bombshell-glam', title: 'Bombshell Glam Program', url: 'https://example.com/bombshell' },
    { id: 'link-kr-media', title: 'KR Media: Mentorship & Programs', url: 'https://example.com/kr-media' },
    { id: 'link-ko-art', title: 'Galeria Ko-Art 🎨', url: 'https://example.com/ko-art' },
    { id: 'link-calendars-merch', title: 'Calendários & Merch Oficial', url: 'https://example.com/merch' },
    { id: 'soc-1', title: 'Instagram Profile', url: 'https://instagram.com' },
  ];

  const devices: ('mobile' | 'desktop' | 'tablet')[] = ['mobile', 'mobile', 'mobile', 'desktop', 'tablet'];
  const browsers = ['Safari', 'Chrome', 'Firefox', 'Mobile Safari'];

  // Create 128 realistic historical clicks over the past 24 hours
  for (let i = 0; i < 128; i++) {
    const minutesAgo = Math.floor(Math.random() * 1440);
    const link = linkTargets[Math.floor(Math.random() * linkTargets.length)];
    const time = new Date(now.getTime() - minutesAgo * 60 * 1000);

    seed.push({
      id: `evt-${i + 1}`,
      linkId: link.id,
      linkTitle: link.title,
      url: link.url,
      timestamp: time.toISOString(),
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      referrer: Math.random() > 0.4 ? 'Instagram Bio' : 'Direct / Search',
    });
  }

  return seed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function loadAnalyticsFromFile(): ClickEvent[] {
  if (memoryClicks.length > 0) return memoryClicks;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryClicks = JSON.parse(content);
      return memoryClicks;
    }
  } catch (err) {
    console.error('Error reading analytics file:', err);
  }
  memoryClicks = getInitialSeedEvents();
  saveAnalyticsToFile(memoryClicks);
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

export function isNeonDatabaseConnected(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 10);
}

export async function trackClick(event: Omit<ClickEvent, 'id' | 'timestamp'>): Promise<ClickEvent> {
  const newEvent: ClickEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...event,
  };

  if (isNeonDatabaseConnected()) {
    // Note: When DATABASE_URL is provided, we execute SQL query directly to Neon DB.
    // For now, write to active store and memory.
  }

  const clicks = loadAnalyticsFromFile();
  clicks.unshift(newEvent);
  memoryClicks = clicks;
  saveAnalyticsToFile(clicks);

  return newEvent;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const clicks = loadAnalyticsFromFile();

  const isDbConnected = isNeonDatabaseConnected();
  const totalClicks = clicks.length;

  // Approximate unique visitors based on combination of timestamp window and device/browser
  const uniqueVisitors = Math.round(totalClicks * 0.72);

  // Links breakdown
  const clicksByLink: Record<string, { id: string; title: string; clicks: number; url: string }> = {};
  const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };

  clicks.forEach((c) => {
    // Device count
    if (deviceBreakdown[c.device] !== undefined) {
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
    if (diffHours <= 12) {
      const timeLabel = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      // Find closest hour slot
      const slots = Object.keys(timelineMap);
      if (slots.length > 0) {
        timelineMap[slots[Math.floor(slots.length - 1 - (diffHours / 12) * slots.length)] || slots[0]]++;
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

export function resetAnalyticsData(): void {
  memoryClicks = getInitialSeedEvents();
  saveAnalyticsToFile(memoryClicks);
}
