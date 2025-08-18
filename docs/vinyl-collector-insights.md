# Vinyl Collector Insights & Feature Roadmap

## Target Demographic Research (30-45 year olds)

### Key Behavioral Patterns

1. **Independent Store & RSD Engagement**
   - 45% of LP sales through indie stores (2016-2023)
   - 35-44 age group is largest buyer segment at indie shops
   - ~44% of 25-44 buyers attended Record Store Day 2024

2. **Collection Motivations**
   - Primary: Collecting as hobby, owning physical artifacts
   - Secondary: Ritual of playing, visual/artwork appreciation
   - Audio quality is NOT the primary driver

3. **Usage Patterns**
   - ~50% of vinyl buyers don't own turntables (artifact collection)
   - Omni-format behavior: Stream for discovery, vinyl for collecting
   - Strong social/identity component to collecting

4. **Price Sensitivity**
   - LP prices up ~24% over 5 years
   - Strategic buying: Used, specific variants, price watching
   - Valuation tools increasingly important

## Priority Feature Implementation

### Phase 1: Pressing-Smart Catalog Enhancement
**Timeline: 2-3 weeks**

#### Features
- **Pressing Variant Tracking**
  - Runout/matrix number fields
  - Color/weight specifications
  - Limited edition numbering
  - Variant-specific artwork
  
- **Enhanced Import/Identification**
  - Barcode scanning
  - Discogs pressing-level import
  - Auto-match to specific releases
  
- **QR Shelf Labels**
  - Generate printable QR codes per record
  - Guest scanning for instant details
  - Direct link to pressing variant

#### Database Changes
```sql
-- Add to vinyl_records table
ALTER TABLE vinyl_records ADD COLUMN pressing_variant VARCHAR(255);
ALTER TABLE vinyl_records ADD COLUMN matrix_number VARCHAR(100);
ALTER TABLE vinyl_records ADD COLUMN vinyl_color VARCHAR(100);
ALTER TABLE vinyl_records ADD COLUMN vinyl_weight VARCHAR(50);
ALTER TABLE vinyl_records ADD COLUMN limited_edition BOOLEAN DEFAULT FALSE;
ALTER TABLE vinyl_records ADD COLUMN edition_number INTEGER;
ALTER TABLE vinyl_records ADD COLUMN edition_total INTEGER;
ALTER TABLE vinyl_records ADD COLUMN variant_notes TEXT;
```

### Phase 2: Valuation & Price Intelligence
**Timeline: 2 weeks**

#### Features
- **Market Value Tracking**
  - Median/low/high price bands
  - Recent sales velocity
  - Collection total value
  
- **Price Alerts**
  - Wishlist price drops
  - Value appreciation notifications
  - Trade-up opportunities
  
- **Duplicate Management**
  - Identify duplicate albums
  - Suggest upgrades (variant → original pressing)
  - Trade/sell recommendations

#### Database Schema
```sql
-- New valuations table
CREATE TABLE valuations (
  id SERIAL PRIMARY KEY,
  record_id INTEGER REFERENCES vinyl_records(id),
  median_price DECIMAL(10,2),
  low_price DECIMAL(10,2),
  high_price DECIMAL(10,2),
  last_sale_price DECIMAL(10,2),
  last_sale_date DATE,
  price_trend VARCHAR(20), -- rising/falling/stable
  sales_velocity INTEGER, -- sales per month
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Price alerts table
CREATE TABLE price_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  discogs_release_id INTEGER,
  target_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 3: Ritual & Social Features
**Timeline: 3 weeks**

#### Features
- **Listening Log**
  - Quick spin tracking
  - Gear chain recording
  - Condition/cleaning notes
  - Memory/mood associations
  
- **"Now Spinning" Kiosk Mode**
  - Fullscreen display mode
  - Large artwork display
  - Guest queue additions
  - Social sharing
  
- **Lending System**
  - QR-based checkout
  - Return reminders
  - Lending history
  - Friend collections

#### Database Schema
```sql
-- Listening sessions
CREATE TABLE listening_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  record_id INTEGER REFERENCES vinyl_records(id),
  played_at TIMESTAMP DEFAULT NOW(),
  turntable VARCHAR(255),
  cartridge VARCHAR(255),
  amplifier VARCHAR(255),
  speakers VARCHAR(255),
  cleaning_performed BOOLEAN DEFAULT FALSE,
  condition_notes TEXT,
  mood VARCHAR(100),
  memory_note TEXT,
  guests TEXT[]
);

-- Lending records
CREATE TABLE record_loans (
  id SERIAL PRIMARY KEY,
  record_id INTEGER REFERENCES vinyl_records(id),
  lender_id INTEGER REFERENCES users(id),
  borrower_name VARCHAR(255),
  borrower_contact VARCHAR(255),
  loaned_at TIMESTAMP DEFAULT NOW(),
  due_date DATE,
  returned_at TIMESTAMP,
  notes TEXT
);
```

### Phase 4: RSD & Store Integration
**Timeline: 2 weeks**

#### Features
- **RSD Planning Board**
  - Wishlist RSD exclusives
  - Budget by store
  - Store locator/maps
  - Day-of checklist
  
- **Store Receipt Tracking**
  - Attach receipts to purchases
  - Track purchase locations
  - Support local shop analytics

### Phase 5: Discovery Bridge
**Timeline: 1 week**

#### Features
- **Streaming Integration**
  - Import top artists from Spotify/Apple
  - Auto-generate wishlist
  - Discovery → Collection pipeline
  
- **Variant Marketing Display**
  - Highlight special editions
  - Show variant comparisons
  - Market availability

## Implementation Priority Order

1. **Pressing Variants** (Highest Impact)
   - Core to collector mindset
   - Differentiates from basic catalogs
   - Enables QR/guest features

2. **Valuation/Price Watch** (High ROI)
   - Addresses price sensitivity
   - Provides ongoing value
   - Encourages engagement

3. **Listening Log & Kiosk** (Daily Use)
   - Ritual reinforcement
   - Social showcase
   - Regular touchpoint

4. **Lending & Social** (Network Effects)
   - Viral growth potential
   - Community building
   - Practical utility

5. **RSD/Store Features** (Seasonal Peaks)
   - Event-driven engagement
   - Local community support
   - Marketing opportunities

## Success Metrics

- **Engagement**: Daily active users, spins logged
- **Collection Growth**: Records added per user per month
- **Social**: Shares, guest views, friend connections
- **Retention**: 30/60/90 day retention rates
- **Value**: Price alerts set, trade-ups completed

## Technical Considerations

- Discogs API rate limits for pressing data
- Image storage for variant artwork
- Real-time price data caching
- QR code generation at scale
- Mobile-first for in-store use