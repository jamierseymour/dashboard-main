<script setup lang="ts">
import { BUDGET_RANGES, useEventSearch } from '~/composables/useEventSearch'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const auth = useAuth()
const { state: searchState } = useEventSearch()

interface IVenue {
  id: number
  venue_name: string
  company_name: string
  min_capacity: number
  max_capacity: number
  notice_required: number
  user_id: string
  photos: string[]
}

const { data: venue } = useAsyncData<IVenue | null>("venue", async () => {
  const id = route.params.id
  const { data } = await client.from("venues").select().eq("id", id)

  if (!data || data.length === 0) {
    throw createError({ statusCode: 404, statusMessage: "Venue not found" })
  }

  return data[0] as IVenue
})

// Form state
const preferredViewingDate = ref('')
const guests = ref(searchState.guestCount || 1)
const message = ref('')

const isSubmitting = ref(false)

const budgetLabel = computed(() => {
  if (!searchState.budgetRange) return null
  return BUDGET_RANGES.find(b => b.value === searchState.budgetRange)?.label || null
})

function preventInvalidChars(event: KeyboardEvent) {
  const invalidChars = ["e", "E", "+", "-"]
  if (invalidChars.includes(event.key)) {
    event.preventDefault()
  }
}

async function submitRequest() {
  if (!user.value) {
    const authenticated = await auth.waitForAuth()

    if (!authenticated) return

    await new Promise(resolve => setTimeout(resolve, 500))

    if (!user.value) {
      toast.add({
        title: "Authentication required",
        description: "Please log in to request a viewing",
        color: "error",
      })
      return
    }
  }

  if (!venue.value || !preferredViewingDate.value) {
    toast.add({
      title: "Missing information",
      description: "Please select a preferred viewing date",
      color: "warning",
    })
    return
  }

  isSubmitting.value = true

  try {
    const viewingDate = new Date(preferredViewingDate.value).toISOString().split("T")[0]
    const eventDate = searchState.weddingDate
      ? new Date(searchState.weddingDate).toISOString().split("T")[0]
      : viewingDate

    const requestData = {
      venue_id: venue.value.id,
      user_id: user.value.id,
      venue_owner_id: venue.value.user_id,
      check_in_date: viewingDate,
      check_out_date: eventDate,
      number_of_guests: guests.value,
      accommodation_needed: searchState.accommodationRequired ? guests.value : 0,
      message_to_host: message.value || null,
      price_per_night: 0,
      number_of_nights: 0,
      subtotal: 0,
      service_fee: 0,
      total_amount: 0,
      booking_status: "pending",
      payment_status: "unpaid",
    }

    const { error } = await client
      .from("bookings")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(requestData as any)
      .select()
      .single()

    if (error) throw error

    toast.add({
      title: "Viewing request sent!",
      description: "The venue host will be in touch to confirm a time.",
      color: "success",
    })

    router.push(`/venues/${venue.value.id}?viewing=requested`)
  }
  catch (error: unknown) {
    console.error("Error submitting viewing request:", error)
    const message = error instanceof Error ? error.message : "Failed to submit your viewing request. Please try again."
    toast.add({
      title: "Request failed",
      description: message,
      color: "error",
    })
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AuthModal />
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Book a Viewing</h1>
        <UButton
          icon="i-heroicons-arrow-left"
          color="neutral"
          variant="outline"
          :to="`/venues/${route.params.id}`"
          label="Back to venue"
          class="rounded-full"
        />
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Step 1: Viewing Details -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">1. Viewing details</h2>
            </template>

            <div class="space-y-6">
              <!-- Preferred Viewing Date -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">
                  Preferred viewing date
                </label>
                <input
                  v-model="preferredViewingDate"
                  type="date"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500">
                  The host may propose an alternative time if needed.
                </p>
              </div>

              <!-- Guest Count -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">
                  Expected guest count
                </label>
                <UInput
                  v-model.number="guests"
                  type="number"
                  :min="venue?.min_capacity || 1"
                  :max="venue?.max_capacity || 1000"
                  size="xl"
                  placeholder="Number of guests"
                  class="[&_input::-webkit-outer-spin-button]:appearance-none [&_input::-webkit-inner-spin-button]:appearance-none [&_input]:[-moz-appearance:textfield]"
                  @keydown="preventInvalidChars"
                />
                <p v-if="venue?.max_capacity" class="mt-1 text-xs text-gray-500">
                  This venue fits up to {{ venue.max_capacity }} guests
                </p>
              </div>
            </div>
          </UCard>

          <!-- Your Event Summary (pre-filled from search) -->
          <UCard v-if="searchState.hasSearched">
            <template #header>
              <h2 class="text-xl font-semibold">Your event details</h2>
            </template>
            <div class="space-y-3 text-sm">
              <div v-if="searchState.weddingDate" class="flex justify-between">
                <span class="text-gray-600">Wedding date</span>
                <span class="font-medium">
                  {{ new Date(searchState.weddingDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                </span>
              </div>
              <div v-if="searchState.guestCount" class="flex justify-between">
                <span class="text-gray-600">Guest count</span>
                <span class="font-medium">{{ searchState.guestCount }} guests</span>
              </div>
              <div v-if="budgetLabel" class="flex justify-between">
                <span class="text-gray-600">Budget</span>
                <span class="font-medium">{{ budgetLabel }}</span>
              </div>
              <div v-if="searchState.city" class="flex justify-between">
                <span class="text-gray-600">Location</span>
                <span class="font-medium">{{ searchState.city }}</span>
              </div>
              <div v-if="searchState.accommodationRequired" class="flex justify-between">
                <span class="text-gray-600">Accommodation</span>
                <span class="font-medium">Required</span>
              </div>
              <div v-if="searchState.stylePreferences.length > 0" class="flex justify-between items-start">
                <span class="text-gray-600">Style</span>
                <span class="font-medium text-right">{{ searchState.stylePreferences.join(', ') }}</span>
              </div>
            </div>
          </UCard>

          <!-- Step 2: Message to Host -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">
                2. Message to host <span class="text-sm font-normal text-gray-500">(optional)</span>
              </h2>
            </template>

            <div class="rounded-lg border border-gray-300 p-4">
              <textarea
                v-model="message"
                placeholder="Tell the host about your vision, any specific questions, or what you'd like to see during the viewing..."
                rows="5"
                class="w-full border-0 focus:outline-none focus:ring-0 resize-none"
              />
            </div>
          </UCard>

          <!-- Step 3: What happens next -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">3. What happens next</h2>
            </template>

            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">1</div>
                <p>The host reviews your request and responds within <strong>24–48 hours</strong>.</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">2</div>
                <p>Once confirmed, you receive the <strong>host's contact details</strong> to coordinate the viewing.</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">3</div>
                <p>Visit the venue, ask questions, and decide if it's the right fit — <strong>completely free</strong>.</p>
              </div>
            </div>
          </UCard>

          <!-- Submit Button -->
          <UButton
            block
            size="xl"
            color="primary"
            class="cursor-pointer"
            :loading="isSubmitting"
            :disabled="!preferredViewingDate || isSubmitting"
            @click="submitRequest"
          >
            Request a Viewing
          </UButton>
        </div>

        <!-- Right Column - Venue Summary -->
        <div class="lg:sticky lg:top-12 h-fit space-y-4">
          <UCard>
            <div class="space-y-5">
              <!-- Venue Info -->
              <div class="flex gap-4">
                <NuxtImg
                  v-if="venue?.photos?.[0]"
                  :src="venue.photos[0]"
                  alt="Venue"
                  class="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                  width="96"
                  height="96"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate">
                    {{ venue?.venue_name }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ venue?.company_name }}
                  </p>
                  <p v-if="venue?.max_capacity" class="text-sm text-gray-500 mt-1">
                    Up to {{ venue.max_capacity }} guests
                  </p>
                </div>
              </div>

              <USeparator />

              <!-- Event Summary -->
              <div v-if="searchState.hasSearched" class="space-y-2">
                <h4 class="text-sm font-semibold text-gray-900">Your event</h4>
                <div v-if="searchState.weddingDate" class="flex justify-between text-sm">
                  <span class="text-gray-500">Wedding date</span>
                  <span class="font-medium">
                    {{ new Date(searchState.weddingDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                  </span>
                </div>
                <div v-if="searchState.guestCount" class="flex justify-between text-sm">
                  <span class="text-gray-500">Guests</span>
                  <span class="font-medium">{{ searchState.guestCount }}</span>
                </div>
                <div v-if="budgetLabel" class="flex justify-between text-sm">
                  <span class="text-gray-500">Budget</span>
                  <span class="font-medium">{{ budgetLabel }}</span>
                </div>
              </div>

              <!-- Notice -->
              <div
                v-if="venue?.notice_required"
                class="flex items-start gap-2 rounded-lg bg-purple-50 p-3"
              >
                <UIcon
                  name="i-heroicons-information-circle"
                  class="h-5 w-5 flex-shrink-0 text-purple-600"
                />
                <p class="text-xs text-purple-900">
                  This venue requires {{ venue.notice_required }} days advance notice for viewings.
                </p>
              </div>

              <div class="rounded-lg bg-green-50 p-3 text-center">
                <p class="text-sm font-semibold text-green-800">Viewings are completely free</p>
                <p class="text-xs text-green-600 mt-1">No payment or commitment required</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
