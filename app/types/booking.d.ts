export type BookingStatus =
  | "pending" // Initial request submitted
  | "confirmed" // Host confirmed the booking
  | "declined" // Host declined the booking
  | "cancelled" // Booking was cancelled
  | "completed"; // Event has taken place

export type PaymentStatus =
  | "unpaid" // No payment made yet
  | "deposit_paid" // Partial payment made
  | "paid" // Full payment completed
  | "refunded" // Payment was refunded
  | "partially_refunded"; // Partial refund issued

export interface BookingRequest {
  // IDs
  id?: string;
  venue_id: string;
  user_id: string;
  venue_owner_id: string; // For quick filtering by venue owner

  // Event Details
  check_in_date: string; // ISO date string
  check_out_date: string; // ISO date string
  number_of_guests: number;
  accommodation_needed: number;

  // Communication
  message_to_host?: string;
  host_response_message?: string;

  // Pricing (snapshot at time of booking)
  price_per_night: number;
  number_of_nights: number;
  subtotal: number;
  service_fee: number;
  total_amount: number;

  // Status
  booking_status: BookingStatus;
  payment_status: PaymentStatus;

  // Timestamps
  created_at?: string;
  updated_at?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;

  // Cancellation
  cancellation_reason?: string;
  cancelled_by?: "guest" | "host"; // Who cancelled
  refund_amount?: number;
}

export interface BookingWithDetails extends BookingRequest {
  // Populated venue details
  venue?: {
    id: string;
    venue_name: string;
    company_name: string;
    photos: string[];
    address: string;
  };

  // Populated user details
  guest?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };

  // Populated host details
  host?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Request payload for creating a booking
export interface CreateBookingRequest {
  venue_id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  accommodation_needed: number;
  message_to_host?: string;
}

// Response payload for updating booking status
export interface UpdateBookingStatusRequest {
  booking_status: BookingStatus;
  host_response_message?: string;
}
