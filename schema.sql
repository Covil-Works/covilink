-- Covilink Schema for Neon PostgreSQL
-- Tabelas criadas vazias, sem nenhum dado mockado

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
  name VARCHAR(255) NOT NULL DEFAULT '',
  handle VARCHAR(255) NOT NULL DEFAULT '',
  show_handle BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT true,
  followers_count VARCHAR(255) DEFAULT '',
  tagline VARCHAR(255) DEFAULT '',
  bio TEXT DEFAULT '',
  show_bio BOOLEAN DEFAULT true,
  avatar_url TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  contact_email VARCHAR(255) DEFAULT '',
  show_contact_email BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portal_links (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(32) NOT NULL DEFAULT 'no-photo',
  title VARCHAR(255) NOT NULL DEFAULT '',
  subtitle VARCHAR(255) DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  image TEXT DEFAULT '',
  badge VARCHAR(64) DEFAULT '',
  icon_name VARCHAR(64) DEFAULT 'ExternalLink',
  category VARCHAR(64) DEFAULT 'custom',
  grid_span VARCHAR(32) DEFAULT 'full',
  active BOOLEAN DEFAULT true,
  has_blur BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portal_links_order ON portal_links(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_portal_links_active ON portal_links(active);

CREATE TABLE IF NOT EXISTS social_links (
  id VARCHAR(64) PRIMARY KEY,
  platform VARCHAR(64) NOT NULL DEFAULT 'instagram',
  title VARCHAR(255) NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  icon VARCHAR(64) DEFAULT '',
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_social_links_order ON social_links(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_social_links_active ON social_links(active);

CREATE TABLE IF NOT EXISTS click_events (
  id VARCHAR(64) PRIMARY KEY,
  link_id VARCHAR(64) NOT NULL,
  link_title VARCHAR(255) NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  device VARCHAR(32) DEFAULT 'mobile',
  browser VARCHAR(64) DEFAULT 'Chrome',
  referrer VARCHAR(255) DEFAULT 'Direto',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_click_events_link_id ON click_events(link_id);
CREATE INDEX IF NOT EXISTS idx_click_events_timestamp ON click_events(timestamp DESC);
