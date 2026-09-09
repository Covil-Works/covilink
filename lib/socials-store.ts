import fs from 'fs/promises';
import path from 'path';
import { SocialLink, INITIAL_SOCIALS } from './links-config';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'socials.json');
const TEMP_FILE_PATH = path.join(DATA_DIR, 'socials.json.tmp');

// In-memory cache for ultra-fast, zero-latency reads & crash-proof fallback
let memoryCache: SocialLink[] | null = null;

/**
 * Sanitizes a SocialLink array to ensure no item has missing fields.
 */
function sanitizeSocials(items: any[]): SocialLink[] {
  if (!Array.isArray(items)) return INITIAL_SOCIALS;
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item, idx) => ({
      id: String(item.id || `soc-${idx}-${Date.now()}`),
      platform: item.platform || 'instagram',
      title: String(item.title || 'Rede Social'),
      url: String(item.url || 'https://'),
      active: item.active !== false,
    }));
}

/**
 * Returns the current list of social links.
 * Uses in-memory cache if available, or loads from disk atomically.
 */
export async function getSocials(): Promise<SocialLink[]> {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    const fileContent = await fs.readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    const sanitized = sanitizeSocials(parsed);
    memoryCache = sanitized;
    return sanitized;
  } catch (error) {
    // Seed with INITIAL_SOCIALS if missing or invalid
    memoryCache = INITIAL_SOCIALS;
    saveSocials(INITIAL_SOCIALS).catch(() => {});
    return INITIAL_SOCIALS;
  }
}

/**
 * Saves updated social links array atomically to disk and updates in-memory cache.
 */
export async function saveSocials(socials: SocialLink[]): Promise<SocialLink[]> {
  const sanitized = sanitizeSocials(socials);
  memoryCache = sanitized;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // Write to a temporary file first, then atomically rename to prevent partial reads
    await fs.writeFile(TEMP_FILE_PATH, JSON.stringify(sanitized, null, 2), 'utf-8');
    await fs.rename(TEMP_FILE_PATH, FILE_PATH);
  } catch (error) {
    console.error('Error writing socials JSON to disk:', error);
  }

  return sanitized;
}
