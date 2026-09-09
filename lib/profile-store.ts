import fs from 'fs/promises';
import path from 'path';
import { ProfileConfig, INITIAL_PROFILE } from './links-config';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'profile.json');
const TEMP_FILE_PATH = path.join(DATA_DIR, 'profile.json.tmp');

let memoryCache: ProfileConfig | null = null;

/**
 * Sanitizes a ProfileConfig object to ensure no missing required fields.
 */
function sanitizeProfile(data: any): ProfileConfig {
  if (!data || typeof data !== 'object') return INITIAL_PROFILE;
  return {
    name: String(data.name || INITIAL_PROFILE.name),
    handle: String(data.handle || INITIAL_PROFILE.handle),
    isVerified: data.isVerified !== false,
    followersCount: String(data.followersCount || INITIAL_PROFILE.followersCount),
    tagline: String(data.tagline || INITIAL_PROFILE.tagline),
    bio: String(data.bio || INITIAL_PROFILE.bio),
    avatarUrl: String(data.avatarUrl || INITIAL_PROFILE.avatarUrl),
    coverImageUrl: data.coverImageUrl !== undefined ? String(data.coverImageUrl) : (INITIAL_PROFILE.coverImageUrl || ''),
    contactEmail: String(data.contactEmail || INITIAL_PROFILE.contactEmail),
  };
}

/**
 * Returns current profile configuration.
 */
export async function getProfile(): Promise<ProfileConfig> {
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
    saveProfile(INITIAL_PROFILE).catch(() => {});
    return INITIAL_PROFILE;
  }
}

/**
 * Saves profile configuration to disk atomically.
 */
export async function saveProfile(profile: ProfileConfig): Promise<ProfileConfig> {
  const sanitized = sanitizeProfile(profile);
  memoryCache = sanitized;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(TEMP_FILE_PATH, JSON.stringify(sanitized, null, 2), 'utf-8');
    await fs.rename(TEMP_FILE_PATH, FILE_PATH);
  } catch (error) {
    console.error('Error writing profile JSON to disk:', error);
  }

  return sanitized;
}
