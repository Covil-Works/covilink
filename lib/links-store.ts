import fs from 'fs/promises';
import path from 'path';
import { LinkItem, INITIAL_LINKS } from './links-config';
import { isNeonDatabaseConnected, queryDb, getPgPool } from './db';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'links.json');
const TEMP_FILE_PATH = path.join(DATA_DIR, 'links.json.tmp');

let memoryCache: LinkItem[] | null = null;

/**
 * Sanitizes an array of LinkItems.
 */
export function sanitizeLinks(items: any[]): LinkItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item, idx) => ({
      id: String(item.id || `link-${idx}-${Date.now()}`),
      type: item.type || 'no-photo',
      title: String(item.title || 'Novo Botão'),
      subtitle: item.subtitle ? String(item.subtitle) : '',
      url: String(item.url || 'https://'),
      image: item.image ? String(item.image) : '',
      imagePosition: item.imagePosition ? String(item.imagePosition) : (item.image_position ? String(item.image_position) : '50% 50%'),
      imageFit: (item.imageFit === 'contain' || item.image_fit === 'contain') ? 'contain' : 'cover',
      badge: item.badge ? String(item.badge) : '',
      badgeColor: item.badgeColor ? String(item.badgeColor) : (item.badge_color ? String(item.badge_color) : ''),
      iconName: item.iconName || item.icon_name || 'ExternalLink',
      category: item.category || 'custom',
      gridSpan: item.gridSpan || item.grid_span || 'full',
      active: item.active !== false,
      hasBlur: Boolean(item.hasBlur || item.has_blur),
      blurText: item.blurText !== undefined ? String(item.blurText) : (item.blur_text !== undefined ? String(item.blur_text) : ''),
    }));
}

/**
 * Returns current links list from PostgreSQL if connected, or cache/disk.
 */
export async function getLinks(): Promise<LinkItem[]> {
  if (isNeonDatabaseConnected()) {
    try {
      const rows = await queryDb<any>(
        `SELECT id, type, title, subtitle, url, image, badge, badge_color, icon_name, category, grid_span, active, has_blur, blur_text, display_order 
         FROM portal_links 
         ORDER BY display_order ASC, created_at ASC;`
      );

      // Mapeia os registros retornados do PostgreSQL
      const links: LinkItem[] = (rows || []).map((row) => ({
        id: String(row.id),
        type: row.type || 'no-photo',
        title: row.title || '',
        subtitle: row.subtitle || '',
        url: row.url || '',
        image: row.image || '',
        badge: row.badge || '',
        badgeColor: row.badge_color || '',
        iconName: row.icon_name || 'ExternalLink',
        category: row.category || 'custom',
        gridSpan: row.grid_span || 'full',
        active: row.active !== false,
        hasBlur: Boolean(row.has_blur),
        blurText: row.blur_text || '',
      }));

      memoryCache = links;
      return links;
    } catch (dbError) {
      console.error('[DB] Error querying portal_links from database, falling back to local store:', dbError);
    }
  }

  if (memoryCache) {
    return memoryCache;
  }

  try {
    const fileContent = await fs.readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    const sanitized = sanitizeLinks(parsed);
    memoryCache = sanitized;
    return sanitized;
  } catch (error) {
    memoryCache = [];
    return [];
  }
}

/**
 * Saves updated links list to PostgreSQL (if connected) and atomically to disk.
 */
export async function saveLinks(links: LinkItem[]): Promise<LinkItem[]> {
  const sanitized = sanitizeLinks(links);
  memoryCache = sanitized;

  if (isNeonDatabaseConnected()) {
    const pool = getPgPool();
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Limpa e reinsere a lista atualizada para garantir a ordem exata
        await client.query('DELETE FROM portal_links');

        for (let i = 0; i < sanitized.length; i++) {
          const l = sanitized[i];
          await client.query(
            `INSERT INTO portal_links (
              id, type, title, subtitle, url, image, badge, badge_color, icon_name, category, grid_span, active, has_blur, blur_text, display_order, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              l.id,
              l.type,
              l.title,
              l.subtitle || '',
              l.url,
              l.image || '',
              l.badge || '',
              l.badgeColor || '',
              l.iconName || 'ExternalLink',
              l.category || 'custom',
              l.gridSpan || 'full',
              l.active !== false,
              Boolean(l.hasBlur),
              l.blurText || '',
              i,
            ]
          );
        }
        await client.query('COMMIT');
      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error('[DB] Error saving portal_links to database:', dbError);
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
    console.error('Error writing links JSON to disk:', error);
  }

  return sanitized;
}
