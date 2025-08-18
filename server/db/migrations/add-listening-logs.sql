-- Add listening logs table for tracking plays with detailed notes
CREATE TABLE IF NOT EXISTS vinyl_vault_listening_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES vinyl_vault_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
  played_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Ritual/context fields
  mood VARCHAR(100),
  location VARCHAR(255),
  weather VARCHAR(100),
  occasion VARCHAR(255),
  
  -- Gear chain (optional)
  turntable VARCHAR(255),
  cartridge VARCHAR(255),
  amplifier VARCHAR(255),
  speakers VARCHAR(255),
  headphones VARCHAR(255),
  
  -- Condition & maintenance
  pre_clean BOOLEAN DEFAULT FALSE,
  condition_notes TEXT,
  
  -- The actual listening notes
  notes TEXT,
  favorite_tracks TEXT[], -- Array of favorite track names/numbers
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Per-session rating
  
  -- Social aspects
  guests TEXT[], -- Array of guest names
  shared_to_social BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add guest comments table for visitor notes
CREATE TABLE IF NOT EXISTS vinyl_vault_guest_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES vinyl_vault_records(id) ON DELETE CASCADE,
  collection_owner_id UUID NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
  
  -- Guest info (no auth required)
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255),
  
  -- The comment
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Moderation
  approved BOOLEAN DEFAULT TRUE, -- Auto-approve by default
  hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add now_spinning table for kiosk mode
CREATE TABLE IF NOT EXISTS vinyl_vault_now_spinning (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
  record_id UUID REFERENCES vinyl_vault_records(id) ON DELETE SET NULL,
  
  -- Current play state
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  side VARCHAR(10), -- A, B, C, D for multi-disc
  
  -- Queue management
  queue_record_ids UUID[] DEFAULT '{}', -- Array of upcoming record IDs
  
  -- Kiosk settings
  show_lyrics BOOLEAN DEFAULT FALSE,
  show_notes BOOLEAN DEFAULT TRUE,
  auto_advance BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS listening_logs_record_idx ON vinyl_vault_listening_logs(record_id);
CREATE INDEX IF NOT EXISTS listening_logs_user_idx ON vinyl_vault_listening_logs(user_id);
CREATE INDEX IF NOT EXISTS listening_logs_played_at_idx ON vinyl_vault_listening_logs(played_at DESC);

CREATE INDEX IF NOT EXISTS guest_comments_record_idx ON vinyl_vault_guest_comments(record_id);
CREATE INDEX IF NOT EXISTS guest_comments_owner_idx ON vinyl_vault_guest_comments(collection_owner_id);
CREATE INDEX IF NOT EXISTS guest_comments_created_idx ON vinyl_vault_guest_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS now_spinning_user_idx ON vinyl_vault_now_spinning(user_id);
CREATE INDEX IF NOT EXISTS now_spinning_active_idx ON vinyl_vault_now_spinning(is_active);

-- Update vinyl_records to ensure we have full image support
-- (imageUrl already exists, but let's add support for multiple images)
ALTER TABLE vinyl_vault_records 
ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cover_image_url TEXT, -- Higher res than thumbnail
ADD COLUMN IF NOT EXISTS back_cover_url TEXT,
ADD COLUMN IF NOT EXISTS label_image_url TEXT;