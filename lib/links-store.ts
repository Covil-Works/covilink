import fs from 'fs/promises';
import path from 'path';
import { LinkItem, INITIAL_LINKS } from './links-config';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'links.json');
const TEMP_FILE_PATH = path.join(DATA_DIR, 'links.json.tmp');

let memoryCache: LinkItem[] | null = null;

/**
 * Sanitizes an array of LinkItems.
 */
function sanitizeLinks(items: any[]): LinkItem[] {
  if (!Array.isArray(items)) return INITIAL_LINKS;
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item, idx) => ({
      id: String(item.id || `link-${idx}-${Date.now()}`),
      type: item.type || 'no-photo',
      title: String(item.title || 'Novo Botão'),
      subtitle: item.subtitle ? String(item.subtitle) : '',
      url: String(item.url || 'https://'),
      image: item.image ? String(item.image) : '',
      badge: item.badge ? String(item.badge) : '',
      iconName: item.iconName ? String(item.iconName) : 'ExternalLink',
      category: item.category || 'custom',
      gridSpan: item.gridSpan || 'full',
      active: item.active !== false,
    }));
}

/**
 * Returns current links list from cache or disk.
 */
export async function getLinks(): Promise<LinkItem[]> {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    const fileContent = await fs.readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    const sanitized = sanitizeLinks(parsed);
    memoryCache = sanitized;
    return sanitized;
  } catch (error) {
    memoryCache = INITIAL_LINKS;
    saveLinks(INITIAL_LINKS).catch(() => {});
    return INITIAL_LINKS;
  }
}

/**
 * Saves updated links list atomically to disk.
 */
export async function saveLinks(links: LinkItem[]): Promise<LinkItem[]> {
  const sanitized = sanitizeLinks(links);
  memoryCache = sanitized;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(TEMP_FILE_PATH, JSON.stringify(sanitized, null, 2), 'utf-8');
    await fs.rename(TEMP_FILE_PATH, FILE_PATH);
  } catch (error) {
    console.error('Error writing links JSON to disk:', error);
  }

  return sanitized;
}
