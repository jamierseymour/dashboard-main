-- Migration: add missing venue columns for search & comparison functionality
-- Run this in your Supabase SQL Editor

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS venue_category           TEXT,
  ADD COLUMN IF NOT EXISTS venue_type               TEXT,
  ADD COLUMN IF NOT EXISTS accommodation_available  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS style_tags               TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS catering_price_per_head  NUMERIC,
  ADD COLUMN IF NOT EXISTS catering_in_house        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS catering_external_allowed BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS day_based_pricing        JSONB,
  ADD COLUMN IF NOT EXISTS exclusive_package        JSONB,
  ADD COLUMN IF NOT EXISTS logo                     TEXT,
  ADD COLUMN IF NOT EXISTS minimum_spend            NUMERIC,
  ADD COLUMN IF NOT EXISTS corkage_fee              NUMERIC;
