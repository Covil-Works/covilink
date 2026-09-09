-- Covilink Schema for Neon PostgreSQL

CREATE TABLE IF NOT EXISTS click_events (
  id VARCHAR(64) PRIMARY KEY,
  link_id VARCHAR(64) NOT NULL,
  link_title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  device VARCHAR(32) DEFAULT 'mobile',
  browser VARCHAR(64) DEFAULT 'Chrome',
  referrer VARCHAR(255) DEFAULT 'Direto',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_click_events_link_id ON click_events(link_id);
CREATE INDEX IF NOT EXISTS idx_click_events_timestamp ON click_events(timestamp);

-- Initial Link Portal Configuration Table
CREATE TABLE IF NOT EXISTS portal_links (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  url TEXT NOT NULL,
  image TEXT,
  badge VARCHAR(64),
  icon_name VARCHAR(64),
  category VARCHAR(64) DEFAULT 'product',
  grid_span VARCHAR(32) DEFAULT 'half',
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0
);
