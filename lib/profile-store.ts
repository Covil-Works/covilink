import fs from 'fs/promises';
import path from 'path';
import { ProfileConfig, INITIAL_PROFILE } from './links-config';
import { isNeonDatabaseConnected, queryDb } from './db';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'profile.json');
const TEMP_FILE_PATH = path.join(DATA_DIR, 'profile.json.tmp');

let memoryCache: ProfileConfig | null = null;

/**
 * Sanitizes a ProfileConfig object to ensure no missing required fields.
 */
export function sanitizeProfile(data: any): ProfileConfig {
  if (!data || typeof data !== 'object') return INITIAL_PROFILE;
  return {
    name: String(data.name || INITIAL_PROFILE.name),
    handle: String(data.handle || INITIAL_PROFILE.handle),
    showHandle: data.showHandle !== false && data.show_handle !== false,
    isVerified: data.isVerified !== false && data.is_verified !== false,
    followersCount: String(data.followersCount || data.followers_count || INITIAL_PROFILE.followersCount),
    bio: String(data.bio || INITIAL_PROFILE.bio),
    showBio: data.showBio !== false && data.show_bio !== false,
    avatarUrl: String(data.avatarUrl || data.avatar_url || INITIAL_PROFILE.avatarUrl),
    coverImageUrl: data.coverImageUrl !== undefined 
      ? String(data.coverImageUrl) 
      : data.cover_image_url !== undefined 
        ? String(data.cover_image_url) 
        : (INITIAL_PROFILE.coverImageUrl || ''),
    contactEmail: String(data.contactEmail || data.contact_email || INITIAL_PROFILE.contactEmail),
    showContactEmail: data.showContactEmail !== false && data.show_contact_email !== false,
  };
}

/**
 * Returns current profile configuration (from PostgreSQL if connected, or local JSON / memory fallback).
 */
export async function getProfile(): Promise<ProfileConfig> {
  if (isNeonDatabaseConnected()) {
    try {
      const rows = await queryDb<any>(
        `SELECT id, name, handle, show_handle, is_verified, followers_count, tagline, bio, show_bio, avatar_url, cover_image_url, contact_email, show_contact_email 
         FROM profiles 
         WHERE id = 'default' 
         LIMIT 1;`
      );

      if (rows && rows.length > 0) {
        const row = rows[0];
        const profile: ProfileConfig = {
          name: row.name ?? '',
          handle: row.handle ?? '',
          showHandle: row.show_handle !== false,
          isVerified: row.is_verified !== false,
          followersCount: row.followers_count ?? '',
          bio: row.bio ?? '',
          showBio: row.show_bio !== false,
          avatarUrl: row.avatar_url ?? '',
          coverImageUrl: row.cover_image_url ?? '',
          contactEmail: row.contact_email ?? '',
          showContactEmail: row.show_contact_email !== false,
        };
        memoryCache = profile;
        return profile;
      }
    } catch (dbError) {
      console.error('[DB] Error querying profile from database, falling back to local store:', dbError);
    }
  }

  if (memoryCache) {
    return memoryCache;
  }

  try {
    const fileContent = await fs.readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    const sanitized = sanitizeProfile(parsed);
    memoryCache = sanitized;
    return sanitized;
  } catch (error) {
    memoryCache = INITIAL_PROFILE;
    return INITIAL_PROFILE;
  }
}

/**
 * Saves profile configuration to PostgreSQL (if connected) and local disk atomically.
 */
export async function saveProfile(profile: ProfileConfig): Promise<ProfileConfig> {
  const sanitized = sanitizeProfile(profile);
  memoryCache = sanitized;

  if (isNeonDatabaseConnected()) {
    try {
      await queryDb(
        `INSERT INTO profiles (
          id, name, handle, show_handle, is_verified, followers_count, tagline, bio, show_bio, avatar_url, cover_image_url, contact_email, show_contact_email, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          handle = EXCLUDED.handle,
          show_handle = EXCLUDED.show_handle,
          is_verified = EXCLUDED.is_verified,
          followers_count = EXCLUDED.followers_count,
          tagline = EXCLUDED.tagline,
          bio = EXCLUDED.bio,
          show_bio = EXCLUDED.show_bio,
          avatar_url = EXCLUDED.avatar_url,
          cover_image_url = EXCLUDED.cover_image_url,
          contact_email = EXCLUDED.contact_email,
          show_contact_email = EXCLUDED.show_contact_email,
          updated_at = CURRENT_TIMESTAMP;`,
        [
          'default',
          sanitized.name,
          sanitized.handle,
          sanitized.showHandle !== false,
          sanitized.isVerified !== false,
          sanitized.followersCount,
          sanitized.tagline || '',
          sanitized.bio,
          sanitized.showBio !== false,
          sanitized.avatarUrl,
          sanitized.coverImageUrl || '',
          sanitized.contactEmail,
          sanitized.showContactEmail !== false,
        ]
      );
    } catch (dbError) {
      console.error('[DB] Error saving profile to database:', dbError);
    }
  }

  // Backup to disk
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(TEMP_FILE_PATH, JSON.stringify(sanitized, null, 2), 'utf-8');
    await fs.rename(TEMP_FILE_PATH, FILE_PATH);
  } catch (error) {
    console.error('Error writing profile JSON to disk:', error);
  }

  return sanitized;
}
