-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    venue_id BIGINT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Event details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
    accommodation_needed INTEGER NOT NULL DEFAULT 0 CHECK (accommodation_needed >= 0),

    -- Communication
    message_to_host TEXT,
    host_response_message TEXT,

    -- Pricing snapshot (stored at time of booking)
    price_per_night DECIMAL(10, 2) NOT NULL,
    number_of_nights INTEGER NOT NULL CHECK (number_of_nights > 0),
    subtotal DECIMAL(10, 2) NOT NULL,
    service_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Status tracking
    booking_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (booking_status IN ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid'
        CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid', 'refunded', 'partially_refunded')),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Cancellation details
    cancellation_reason TEXT,
    cancelled_by VARCHAR(10) CHECK (cancelled_by IN ('guest', 'host')),
    refund_amount DECIMAL(10, 2),

    -- Constraints
    CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT valid_accommodation CHECK (accommodation_needed <= number_of_guests)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON public.bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_owner_id ON public.bookings(venue_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings (as guest)
CREATE POLICY "Users can view their own bookings"
    ON public.bookings FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Venue owners can view bookings for their venues
CREATE POLICY "Venue owners can view their venue bookings"
    ON public.bookings FOR SELECT
    USING (auth.uid() = venue_owner_id);

-- Policy: Users can create bookings
CREATE POLICY "Users can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Venue owners can update bookings for their venues (status, response)
CREATE POLICY "Venue owners can update their venue bookings"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = venue_owner_id);

-- Policy: Users can update their own bookings (cancel)
CREATE POLICY "Users can update their own bookings"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.bookings IS 'Stores venue booking requests and their status';
COMMENT ON COLUMN public.bookings.venue_owner_id IS 'Denormalized for quick filtering - should match the owner of the venue';
COMMENT ON COLUMN public.bookings.booking_status IS 'Current status of the booking request';
COMMENT ON COLUMN public.bookings.payment_status IS 'Current payment status';
