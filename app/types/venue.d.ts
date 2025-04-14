export type DayAvailability = {
  open: string
  close: string
}

export type WeeklyAvailability = {
  monday: DayAvailability
  tuesday: DayAvailability
  wednesday: DayAvailability
  thursday: DayAvailability
  friday: DayAvailability
  saturday: DayAvailability
  sunday: DayAvailability
}

export type AdditionalService = {
  id: string
  name: string
  price: number
  description: string
  available: boolean
}

export type VenuePackage = {
  id: string
  name: string
  includes: string[]
  price: number
  description: string
}

export type VenueDocuments = {
  terms?: string
  floorPlan?: string
  safetyProtocols?: string
  insuranceCertificate?: string
  licenses?: string[]
}

export type VenuePictures = {
  main: string[]
  virtual360?: string
  floorPlan?: string
  thumbnail?: string
}

export type VenueCatering = {
  inHouse: boolean
  externalAllowed: boolean
  preferredVendors?: string[]
  minimumSpend?: number
  pricePerHead?: number
}

export type VenueLocation = {
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
  parkingSpaces?: number
  wheelchairAccessible: boolean
  publicTransportNearby: boolean
  parkingNotes?: string
}

export type SeasonalPricing = {
  peak: number
  offPeak: number
  peakMonths?: number[]
}

export type CancellationPolicy = {
  refundableDays: number // Days before event for full refund
  partialRefundDays: number // Days before event for partial refund
  partialRefundPercentage: number // Percentage refunded
  nonRefundableDays: number // Days before event where no refund applies
}

export type VenueAmenities = {
  wifi: boolean
  kitchen: boolean
  stage: boolean
  bar: boolean
  soundSystem: boolean
  lighting: boolean
  projector: boolean
  microphone: boolean
  airConditioning: boolean
  heating: boolean
  tables: number
  chairs: number
  danceFloor: boolean
  outdoorSpace: boolean
  indoorSpace: boolean
  customAmenities?: string[]
}

export type VenueContact = {
  contactPerson: string
  contactEmail: string
  contactPhone: string
  businessRegistration?: string
  insurance: boolean
  alternativePhone?: string
  preferredContactMethod: 'email' | 'phone'
}

export type VenueSpecifications = {
  floorPlan?: string
  ceilingHeight?: number
  powerSupply: string
  setupTime: number
  cleanupTime: number
  noiseRestrictions?: string
  squareMeters?: number
  maxDecibels?: number
}

export type VenueStats = {
  rating: number
  reviewCount: number
  verifiedBookings: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  views: number
  bookingRate?: number
}

export type EventType =
  | 'Wedding'
  | 'Conference'
  | 'Corporate Event'
  | 'Birthday'
  | 'Corporate'
  | 'Concert'
  | 'Exhibition'
  | 'Workshop'
  | 'Social'
  | 'Private Party'
  | 'Team Building'
  | 'Other'

export type Province =
  | 'Eastern Cape'
  | 'Free State'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'Northern Cape'
  | 'North West'
  | 'Western Cape'

export interface VenueFormData {
  photos: string[]
  description: string
  venueName: string
  minCapacity: string
  maxCapacity: string
  companyName: string
  price: string
  selectedProvince: Province | null
  provinces: Province | null
  eventTypes: EventType[]
  address: string
  seasonalPricing?: SeasonalPricing
  minimumHours: number
  noticeRequired: number // days
  cancellationPolicy?: CancellationPolicy
  amenities?: VenueAmenities
}

export interface Venue {
  id: string
  name: string
  companyName?: string
  description: string
  province: Province
  eventTypes: EventType[]

  // Capacity & Pricing
  minCapacity: number
  maxCapacity: number
  price: number
  seasonalPricing?: SeasonalPricing
  minimumHours: number
  noticeRequired: number // days
  cancellationPolicy: string

  // Core Details
  location: VenueLocation
  amenities: VenueAmenities
  contact: VenueContact
  specifications: VenueSpecifications

  // Media & Documentation
  pictures: VenuePictures
  documents: VenueDocuments

  // Services & Packages
  catering: VenueCatering
  additionalServices: AdditionalService[]
  packages: VenuePackage[]

  // Availability
  availability: WeeklyAvailability

  // Stats & Metadata
  stats: VenueStats

  // Status
  active: boolean
  verified: boolean
}

// Request/Response Types
export type CreateVenueRequest = Omit<Venue, 'id' | 'stats' | 'verified'>

export type UpdateVenueRequest = Partial<CreateVenueRequest>

export type VenueSearchFilters = {
  province?: Province
  eventType?: EventType
  minCapacity?: number
  maxCapacity?: number
  minPrice?: number
  maxPrice?: number
  amenities?: (keyof VenueAmenities)[]
  date?: Date
  wheelchairAccessible?: boolean
  outdoorSpace?: boolean
  indoorSpace?: boolean
}
