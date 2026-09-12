import fs from 'fs/promises';
import path from 'path';
import { SocialLink, INITIAL_SOCIALS } from './links-config';
import { isNeonDatabaseConnected, queryDb, getPgPool } from './db';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'socials.json');
const TEMP_FILE_PATH = path.join(DATA_DIR, 'socials.json.tmp');

// In-memory cache for ultra-fast, zero-latency reads & crash-proof fallback
let memoryCache: SocialLink[] | null = null;

/**
 * Sanitizes a SocialLink array to ensure no item has missing fields.
 */
export function sanitizeSocials(items: any[]): SocialLink[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item, idx) => ({
      id: String(item.id || `soc-${idx}-${Date.now()}`),
      platform: item.platform || 'instagram',
      title: String(item.title || 'Rede Social'),
      url: String(item.url || 'https://'),
      icon: item.icon ? String(item.icon) : '',
      active: item.active !== false,
    }));
}

/**
 * Returns the current list of social links from PostgreSQL (if connected) or disk.
 */
export async function getSocials(): Promise<SocialLink[]> {
  if (isNeonDatabaseConnected()) {
    try {
      const rows = await queryDb<any>(
        `SELECT id, platform, title, url, icon, active, display_order 
         FROM social_links 
         ORDER BY display_order ASC, created_at ASC;`
      );

      const socials: SocialLink[] = (rows || []).map((row) => ({
        id: String(row.id),
        platform: row.platform || 'instagram',
        title: row.title || '',
        url: row.url || '',
        icon: row.icon || '',
        active: row.active !== false,
      }));

      memoryCache = socials;
      return socials;
    } catch (dbError) {
      console.error('[DB] Error querying social_links from database, falling back to local store:', dbError);
    }
  }

  if (memoryCache) {
    return memoryCache;
  }

  try {
    const fileContent = await fs.readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    const sanitized = sanitizeSocials(parsed);
    memoryCache = sanitized;
    return sanitized;
  } catch (error) {
    memoryCache = [];
    return [];
  }
}

/**
 * Saves updated social links array to PostgreSQL (if connected) and atomically to disk.
 */
export async function saveSocials(socials: SocialLink[]): Promise<SocialLink[]> {
  const sanitized = sanitizeSocials(socials);
  memoryCache = sanitized;

  if (isNeonDatabaseConnected()) {
    const pool = getPgPool();
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM social_links');

        for (let i = 0; i < sanitized.length; i++) {
          const s = sanitized[i];
          await client.query(
            `INSERT INTO social_links (
              id, platform, title, url, icon, active, display_order, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              s.id,
              s.platform,
              s.title,
              s.url,
              s.icon || '',
              s.active !== false,
              i,
            ]
          );
        }
        await client.query('COMMIT');
      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error('[DB] Error saving social_links to database:', dbError);
      } finally {
        client.release();
      }
    }
  }

  // Backup to disk
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(TEMP_FILE_PATH, JSON.stringify(sanitized, null, 2), 'utf-8');
    await fs.rename(TEMP_FILE_PATH, FILE_PATH);
  } catch (error) {
    console.error('Error writing socials JSON to disk:', error);
  }

  return sanitized;
}
