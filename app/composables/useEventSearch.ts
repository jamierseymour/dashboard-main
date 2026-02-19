// Shared state for lead qualification / event search
// Persists from /venues → /venues/[id] → /venues/[id]/request

export interface EventSearchState {
  weddingDate: string | null
  guestCount: number | null
  budgetRange: string | null
  city: string | null
  stylePreferences: string[]
  accommodationRequired: boolean
  hasSearched: boolean
}

const state = reactive<EventSearchState>({
  weddingDate: null,
  guestCount: null,
  budgetRange: null,
  city: null,
  stylePreferences: [],
  accommodationRequired: false,
  hasSearched: false,
})

export const BUDGET_RANGES = [
  { label: 'Under R100k', value: 'under_100k', min: 0, max: 100000 },
  { label: 'R100k – R200k', value: '100k_200k', min: 100000, max: 200000 },
  { label: 'R200k – R350k', value: '200k_350k', min: 200000, max: 350000 },
  { label: 'R350k+', value: '350k_plus', min: 350000, max: Infinity },
]

export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
]

export const STYLE_OPTIONS = [
  'Garden',
  'Rustic',
  'Modern',
  'Beach',
  'Vineyard',
  'Barn',
  'Country',
  'Industrial',
  'Bushveld',
]

export function useEventSearch() {
  function setSearch(data: Partial<EventSearchState>) {
    Object.assign(state, data, { hasSearched: true })
  }

  function clearSearch() {
    Object.assign(state, {
      weddingDate: null,
      guestCount: null,
      budgetRange: null,
      city: null,
      stylePreferences: [],
      accommodationRequired: false,
      hasSearched: false,
    })
  }

  // Estimated cost range for a venue based on guest count
  // Uses venue base price as a proxy for venue hire
  function estimateCostRange(venuePrice: number, guestCount: number | null): { low: number, high: number } | null {
    if (!guestCount || !venuePrice) return null
    // Venue hire + catering estimate (R600–R900 per head typical SA range)
    const cateringLow = guestCount * 600
    const cateringHigh = guestCount * 900
    return {
      low: venuePrice + cateringLow,
      high: venuePrice + cateringHigh,
    }
  }

  function formatEstimate(low: number, high: number): string {
    const fmt = (n: number) => {
      if (n >= 1000000) return `R${(n / 1000000).toFixed(1)}m`
      if (n >= 1000) return `R${Math.round(n / 1000)}k`
      return `R${n}`
    }
    return `Est. ${fmt(low)} – ${fmt(high)}`
  }

  return {
    state: readonly(state),
    setSearch,
    clearSearch,
    estimateCostRange,
    formatEstimate,
    BUDGET_RANGES,
    SA_PROVINCES,
    STYLE_OPTIONS,
  }
}
