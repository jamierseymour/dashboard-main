<script setup lang="ts">
import type { VenueFormData } from '@/types/venue'
import DetailsStep from '@/components/Venue/DetailsStep.vue'
import MediaStep from '@/components/Venue/MediaStep.vue'
import ExtrasStep from '@/components/Venue/ExtrasStep.vue'
import BookingRequirements from '@/components/Venue/BookingReqsStep.vue'
import AddressInput from '@/components/Form/AddressInput.vue'

const supabase = useSupabaseClient()

const formData = ref<VenueFormData>({
  photos: [],
  description: '',
  venueName: '',
  minCapacity: '',
  maxCapacity: '',
  companyName: '',
  price: '',
  selectedProvince: null,
  provinces: null,
  eventTypes: [],
  address: '',
  minimumHours: 0,
  noticeRequired: 0,
  // Initialize cancellationPolicy with default values
  cancellationPolicy: {
    refundableDays: 0,
    partialRefundDays: 0,
    partialRefundPercentage: 0,
    nonRefundableDays: 0
  },
  // Initialize seasonalPricing with default values
  seasonalPricing: {
    peak: 0,
    offPeak: 0,
    peakMonths: []
  },
  // Initialize amenities with default values
  amenities: {
    wifi: false,
    kitchen: false,
    stage: false,
    bar: false,
    soundSystem: false,
    lighting: false,
    projector: false,
    microphone: false,
    airConditioning: false, // Corrected typo
    heating: false,
    danceFloor: false,
    outdoorSpace: false,
    indoorSpace: false,
    tables: 0,
    chairs: 0,
    customAmenities: []
  }
})

// Track current step
const currentStep = ref(0)

const items = [
  {
    slot: 'details',
    title: 'Venue Details',
    description: 'Basic information about your venue',
    icon: 'i-lucide-building'
  },
  {
    slot: 'booking',
    title: 'Booking Requirements',
    description: 'Nitty Gritty Details for booking your venue',
    icon: 'i-lucide-check-circle'
  },
  {
    slot: 'extras',
    title: 'Extras and Amenities',
    description: 'Review and submit your venue',
    icon: 'i-lucide-check-circle'
  },
  {
    slot: 'media',
    title: 'Location',
    description: 'Where is your venue located',
    icon: 'i-lucide-map-pin'
  }
]

const SubmitVenue = async () => {
  console.log('Submitting venue:', formData.value)
  try {
    // Prepare the data for Supabase
    const { data, error } = await supabase.from('venues').insert([
      {
        venue_name: formData.value.venueName,
        company_name: formData.value.companyName,
        description: formData.value.description,
        selected_province: formData.value.selectedProvince,
        event_types: formData.value.eventTypes,
        min_capacity: parseInt(formData.value.minCapacity),
        max_capacity: parseInt(formData.value.maxCapacity),
        price: parseFloat(formData.value.price),
        minimum_hours: formData.value.minimumHours,
        notice_required: formData.value.noticeRequired,
        cancellation_policy: formData.value.cancellationPolicy,
        photos: formData.value.photos,
        provinces: formData.value.provinces,
        address: formData.value.address,
        // Add seasonal pricing data
        seasonal_pricing: {
          peak: formData.value.seasonalPricing?.peak ?? 0,
          off_peak: formData.value.seasonalPricing?.offPeak ?? 0,
          peak_months: formData.value.seasonalPricing?.peakMonths ?? []
        },

        // Add amenities data with fallback
        amenities: {
          wifi: formData.value.amenities?.wifi ?? false,
          kitchen: formData.value.amenities?.kitchen ?? false,
          stage: formData.value.amenities?.stage ?? false,
          bar: formData.value.amenities?.bar ?? false,
          sound_system: formData.value.amenities?.soundSystem ?? false,
          lighting: formData.value.amenities?.lighting ?? false,
          projector: formData.value.amenities?.projector ?? false,
          microphone: formData.value.amenities?.microphone ?? false,
          air_conditioning: formData.value.amenities?.airConditioning ?? false,
          heating: formData.value.amenities?.heating ?? false,
          dance_floor: formData.value.amenities?.danceFloor ?? false,
          outdoor_space: formData.value.amenities?.outdoorSpace ?? false,
          indoor_space: formData.value.amenities?.indoorSpace ?? false,
          tables: parseInt(formData.value.amenities?.tables?.toString() ?? '0'),
          chairs: parseInt(formData.value.amenities?.chairs?.toString() ?? '0'),
          custom_amenities: formData.value.amenities?.customAmenities ?? []
        }
      }
    ])

    if (error) throw error
    console.log('Venue submitted successfully:', data)
  } catch (error) {
    console.error('Error submitting venue:', error)
  }
}

const stepper = useTemplateRef('stepper')

console.log('stepper', stepper)
</script>

<template>
  <div class="mt-24">
    <UStepper
      ref="stepper"
      v-model="currentStep"
      :items="items"
      class="w-full"
    >
      <template #details>
        <DetailsStep
          :form-data="formData"
          @update:form-data="formData = $event"
        />
      </template>

      <template #extras>
        <ExtrasStep
          :form-data="formData"
          @update:form-data="formData = $event"
        />
      </template>

      <template #booking>
        <BookingRequirements
          :form-data="formData"
          @update:form-data="(newData) => (formData = newData)"
        />
      </template>

      <template #media>
        <MediaStep
          :form-data="formData"
          @update:form-data="formData = $event"
        />
      </template>
    </UStepper>

    <div class="flex items-center justify-center mt-4">
      <div class="flex justify-between w-full max-w-1/2">
        <UButton
          leading-icon="i-lucide-arrow-left"
          :disabled="!stepper?.hasPrev"
          class="cursor-pointer"
          @click="stepper?.prev()"
        >
          Prev
        </UButton>

        <UButton
          v-if="stepper?.hasNext"
          trailing-icon="i-lucide-arrow-right"
          :disabled="!stepper?.hasNext"
          class="cursor-pointer"
          @click="stepper?.next()"
        >
          Next
        </UButton>

        <UButton
          v-else
          trailing-icon="i-lucide-arrow-right"
          class="cursor-pointer"
          @click="SubmitVenue()"
        >
          Submit
        </UButton>
      </div>
    </div>
  </div>
</template>
