<script setup lang="ts">
import { BUDGET_RANGES } from '~/composables/useEventSearch'

type LeadAction = 'book-viewing' | 'unlock-estimate' | 'message-host'

const props = defineProps<{
  open: boolean
  action: LeadAction
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submitted: []
}>()

const { state, setSearch, qualifyLead } = useEventSearch()

// Pre-fill from any existing search state
const name = ref(state.leadName || '')
const email = ref(state.leadEmail || '')
const phone = ref(state.leadPhone || '')
const weddingDate = ref(state.weddingDate || '')
const guestCount = ref<number | null>(state.guestCount)
const budgetRange = ref(state.budgetRange || '')

const title = computed(() => {
  if (props.action === 'book-viewing') return 'Book a Viewing'
  if (props.action === 'unlock-estimate') return 'Unlock Full Cost Estimate'
  return 'Message the Host'
})

const subtitle = computed(() => {
  if (props.action === 'book-viewing')
    return "Tell us about your event and we'll arrange a free venue viewing."
  if (props.action === 'unlock-estimate')
    return 'Share your event details to unlock a personalised cost estimate.'
  return 'Introduce yourself so the host can get back to you.'
})

const submitLabel = computed(() => {
  if (props.action === 'book-viewing') return 'Book Viewing'
  if (props.action === 'unlock-estimate') return 'Unlock Estimate'
  return 'Send Message'
})

const budgetOptions = BUDGET_RANGES.map(b => ({ label: b.label, value: b.value }))

const nameError = ref('')
const emailError = ref('')

function validate() {
  nameError.value = name.value.trim() ? '' : 'Name is required'
  emailError.value = email.value.trim()
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Enter a valid email'
    : 'Email is required'
  return !nameError.value && !emailError.value
}

function handleSubmit() {
  if (!validate()) return

  setSearch({
    weddingDate: weddingDate.value || null,
    guestCount: guestCount.value,
    budgetRange: budgetRange.value || null,
    city: state.city,
    stylePreferences: state.stylePreferences,
    accommodationRequired: state.accommodationRequired,
  })
  qualifyLead(name.value.trim(), email.value.trim(), phone.value.trim())

  emit('submitted')
  emit('update:open', false)
}
</script>

<template>
  <UModal :open="open" @update:open="$emit('update:open', $event)" :ui="{ width: 'sm:max-w-lg' }">
    <template #content>
      <div class="p-6">
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
        </div>

        <div class="space-y-4">
          <!-- Event details row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Wedding date -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Wedding date
              </label>
              <FormDateInput v-model="weddingDate" placeholder="Select date" />
            </div>

            <!-- Guest count -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Guest count
              </label>
              <input
                v-model.number="guestCount"
                type="number"
                min="1"
                placeholder="e.g. 120"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Budget range -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Budget range
            </label>
            <USelect
              v-model="budgetRange"
              :items="budgetOptions"
              placeholder="Select your budget"
              value-key="value"
              class="w-full"
            />
          </div>

          <hr class="border-gray-200" />

          <!-- Contact details -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Your name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="name"
              type="text"
              placeholder="Jane Smith"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :class="nameError ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="nameError" class="mt-1 text-xs text-red-500">{{ nameError }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Email address <span class="text-red-500">*</span>
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="jane@example.com"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :class="emailError ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="emailError" class="mt-1 text-xs text-red-500">{{ emailError }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Phone <span class="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <input
              v-model="phone"
              type="tel"
              placeholder="+27 82 000 0000"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 flex flex-col gap-3">
          <UButton
            block
            size="lg"
            color="primary"
            class="cursor-pointer"
            @click="handleSubmit"
          >
            {{ submitLabel }}
          </UButton>
          <p class="text-center text-xs text-gray-400">
            Your details are only shared with this venue's host.
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>
