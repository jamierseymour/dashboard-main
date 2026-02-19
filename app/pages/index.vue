<script setup lang="ts">
import { useEventSearch, BUDGET_RANGES, SA_PROVINCES } from '~/composables/useEventSearch'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { setSearch } = useEventSearch()

// Modal state
const showModal = ref(false)
const currentStep = ref(1)
const totalSteps = 5
const isSubmitting = ref(false)

// Form data
const form = reactive({
  weddingDate: '',
  guestCount: null as number | null,
  budgetRange: '',
  location: '',
  name: '',
  email: '',
})

const budgetOptions = BUDGET_RANGES.map(b => ({ label: b.label, value: b.value }))
const locationOptions = SA_PROVINCES.map(p => ({ label: p, value: p }))

const progressPercent = computed(() => ((currentStep.value - 1) / totalSteps) * 100)

const canAdvance = computed(() => {
  if (currentStep.value === 1) return !!form.weddingDate
  if (currentStep.value === 2) return !!form.guestCount && form.guestCount > 0
  if (currentStep.value === 3) return !!form.budgetRange
  if (currentStep.value === 4) return !!form.location
  if (currentStep.value === 5) return !!form.name && !!form.email
  return false
})

function openModal() {
  currentStep.value = 1
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  showModal.value = false
  document.body.style.overflow = ''
}

function nextStep() {
  if (!canAdvance.value) return
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
  else {
    handleSubmit()
  }
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

async function handleSubmit() {
  isSubmitting.value = true
  setSearch({
    weddingDate: form.weddingDate || null,
    guestCount: form.guestCount,
    budgetRange: form.budgetRange || null,
    city: form.location || null,
  })
  await nextTick()
  closeModal()
  router.push('/venues')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
  if (e.key === 'Enter' && canAdvance.value) nextStep()
}

onUnmounted(() => {
  document.body.style.overflow = ''
})

// Testimonials
const testimonials = [
  {
    quote: 'We found our dream venue in under a week. Knowing the estimated cost upfront made budgeting so much easier.',
    name: 'Sarah & James',
    location: 'Married at Boschendal, Western Cape',
  },
  {
    quote: 'No more chasing venues for pricing. We saw exactly what fit our budget and booked a viewing on the same day.',
    name: 'Anika & Deon',
    location: 'Married at La Motte, Franschhoek',
  },
]
</script>

<template>
  <div class="bg-white">
    <!-- ─── SECTION 1: HERO ─────────────────────────────────── -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Left: Text -->
          <div class="max-w-xl">
            <p class="text-sm font-semibold tracking-widest text-rose-400 uppercase mb-4">
              Cape Town Wedding Venues
            </p>
            <h1 class="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] text-gray-900 mb-6 tracking-tight">
              Find Your Wedding Venue —<br>
              <span class="text-rose-400">Without the Pricing Guesswork</span>
            </h1>
            <p class="text-xl text-gray-500 leading-relaxed mb-10">
              Tell us your date, guest count and budget. We'll show you venues that actually fit.
            </p>
            <button
              class="inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-700 text-white font-medium text-lg px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              @click="openModal"
            >
              Find My Matching Venues
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <p class="mt-4 text-sm text-gray-400">
              Takes less than 60 seconds. No spam. No obligation.
            </p>
          </div>

          <!-- Right: Image -->
          <div class="relative hidden lg:block">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img
                src="/images/find/hero.png"
                alt="Elegant wedding venue"
                class="w-full h-full object-cover"
              />
              <!-- Subtle warm overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent" />
            </div>
            <!-- Floating cost badge -->
            <div class="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl px-5 py-4 border border-stone-100">
              <p class="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Estimated for 120 guests</p>
              <p class="text-xl font-semibold text-gray-900">R165,000 – R190,000</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 2: PROBLEM ──────────────────────────────── -->
    <section class="bg-stone-50 py-20 lg:py-28">
      <div class="max-w-5xl mx-auto px-6 lg:px-12">
        <div class="max-w-2xl mb-14">
          <h2 class="text-3xl sm:text-4xl font-semibold text-gray-900 mb-5 tracking-tight">
            Finally, Wedding Venue Clarity.
          </h2>
          <p class="text-lg text-gray-500 leading-relaxed">
            Most couples spend weeks emailing venues, waiting for quotes, and attending viewings — only to discover the venue is far outside their budget. You deserve better than that.
          </p>
        </div>

        <div class="grid sm:grid-cols-3 gap-6">
          <!-- Pain point 1 -->
          <div class="bg-white rounded-2xl p-7 shadow-sm border border-stone-100">
            <div class="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mb-5">
              <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Misleading "starting from" prices</h3>
            <p class="text-sm text-gray-500 leading-relaxed">
              Advertised prices rarely reflect what you'll actually pay once catering, staffing and extras are included.
            </p>
          </div>

          <!-- Pain point 2 -->
          <div class="bg-white rounded-2xl p-7 shadow-sm border border-stone-100">
            <div class="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mb-5">
              <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Endless email back and forth</h3>
            <p class="text-sm text-gray-500 leading-relaxed">
              Chasing quotes from multiple venues takes days. You're planning a wedding, not a full-time job.
            </p>
          </div>

          <!-- Pain point 3 -->
          <div class="bg-white rounded-2xl p-7 shadow-sm border border-stone-100">
            <div class="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mb-5">
              <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Viewings that don't match your budget</h3>
            <p class="text-sm text-gray-500 leading-relaxed">
              You fall in love with a venue, then discover it's double your budget. Time wasted, emotions spent.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 3: SOLUTION ─────────────────────────────── -->
    <section class="py-20 lg:py-28">
      <div class="max-w-5xl mx-auto px-6 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-3xl sm:text-4xl font-semibold text-gray-900 mb-5 tracking-tight">
              Compare Real Estimated Costs Upfront
            </h2>
            <p class="text-lg text-gray-500 leading-relaxed mb-8">
              Every venue on our platform shows you a transparent cost breakdown so you know what to expect before you step foot through the door.
            </p>
            <ul class="space-y-4 mb-10">
              <li
                v-for="item in ['Estimated total for your guest count', 'Per-head catering cost', 'Venue hire fee', 'Seasonal variation', 'Minimum spend requirements']"
                :key="item"
                class="flex items-center gap-3 text-gray-700"
              >
                <div class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {{ item }}
              </li>
            </ul>
            <button
              class="inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-700 text-white font-medium text-base px-7 py-3.5 rounded-full transition-all duration-200 shadow-md cursor-pointer"
              @click="openModal"
            >
              Start Matching
            </button>
          </div>

          <!-- Highlighted estimate card -->
          <div class="bg-stone-50 rounded-3xl p-8 border border-stone-100">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
              Example estimate
            </p>
            <div class="space-y-4 mb-6">
              <div class="flex justify-between items-center py-3 border-b border-stone-200">
                <span class="text-gray-600">Venue hire</span>
                <span class="font-medium text-gray-900">R45,000</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-stone-200">
                <span class="text-gray-600">Catering (120 pax × R750)</span>
                <span class="font-medium text-gray-900">R90,000</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-stone-200">
                <span class="text-gray-600">Seasonal adjustment</span>
                <span class="font-medium text-gray-900">+5%</span>
              </div>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
              <p class="text-sm text-gray-500 mb-1">Estimated total for 120 guests</p>
              <p class="text-2xl font-semibold text-gray-900">R165,000 – R190,000</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 4: HOW IT WORKS ─────────────────────────── -->
    <section class="bg-stone-50 py-20 lg:py-28">
      <div class="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <h2 class="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
          How It Works
        </h2>
        <p class="text-lg text-gray-500 mb-16">
          Three steps to your shortlist of venues — with pricing included.
        </p>

        <div class="grid sm:grid-cols-3 gap-10 relative">
          <!-- Connector line (desktop) -->
          <div class="hidden sm:block absolute top-7 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-stone-200" />

          <div
            v-for="(step, i) in [
              { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Enter your date & guest count', desc: 'Tell us when you\'re getting married and how many guests you\'re expecting.' },
              { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Set your budget', desc: 'Choose a budget range and we\'ll only show you venues that genuinely fit.' },
              { icon: 'M4.5 12.75l6 6 9-13.5', title: 'Compare venues & book viewings', desc: 'Browse matched venues with estimated costs and request a free viewing instantly.' },
            ]"
            :key="i"
            class="relative flex flex-col items-center"
          >
            <div class="w-14 h-14 rounded-full bg-white shadow-sm border border-stone-200 flex items-center justify-center mb-5 relative z-10">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="step.icon" />
              </svg>
            </div>
            <div class="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mb-4">
              {{ i + 1 }}
            </div>
            <h3 class="font-semibold text-gray-900 mb-2 text-center">{{ step.title }}</h3>
            <p class="text-sm text-gray-500 text-center leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 5: TRUST ────────────────────────────────── -->
    <section class="py-20 lg:py-28">
      <div class="max-w-5xl mx-auto px-6 lg:px-12 text-center">
        <p class="text-sm font-semibold uppercase tracking-widest text-rose-400 mb-4">
          Trusted by Couples
        </p>
        <h2 class="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
          Partnering with Curated Venues<br class="hidden sm:block"> Across Cape Town
        </h2>
        <p class="text-lg text-gray-500 mb-16 max-w-xl mx-auto">
          Every venue on our platform is personally reviewed. We only list venues that meet our standards for quality, transparency, and service.
        </p>

        <div class="grid sm:grid-cols-2 gap-6">
          <div
            v-for="t in testimonials"
            :key="t.name"
            class="bg-stone-50 rounded-2xl p-8 text-left border border-stone-100"
          >
            <div class="flex gap-1 mb-5">
              <svg v-for="n in 5" :key="n" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p class="text-gray-700 leading-relaxed mb-6 italic">"{{ t.quote }}"</p>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ t.name }}</p>
              <p class="text-xs text-gray-400">{{ t.location }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 6: FINAL CTA ────────────────────────────── -->
    <section class="bg-gray-900 py-20 lg:py-28">
      <div class="max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <h2 class="text-3xl sm:text-4xl font-semibold text-white mb-5 tracking-tight">
          Ready to See Venues That Fit?
        </h2>
        <p class="text-lg text-gray-400 mb-10">
          Join couples across Cape Town who found their venue — and their budget clarity — in under 60 seconds.
        </p>
        <button
          class="inline-flex items-center gap-3 bg-white hover:bg-stone-100 text-gray-900 font-medium text-lg px-8 py-4 rounded-full transition-all duration-200 shadow-lg cursor-pointer"
          @click="openModal"
        >
          Find My Matching Venues
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        <p class="mt-4 text-sm text-gray-500">No spam. No obligation. Takes 60 seconds.</p>
      </div>
    </section>

    <!-- ─── 5-STEP QUESTIONNAIRE MODAL ──────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @keydown="handleKeydown"
          @click.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />

          <!-- Modal panel -->
          <div
            class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            @click.stop
          >
            <!-- Progress bar -->
            <div class="h-1 bg-stone-100">
              <div
                class="h-full bg-rose-400 transition-all duration-500 ease-out"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>

            <!-- Header -->
            <div class="flex items-center justify-between px-8 pt-7 pb-2">
              <span class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Step {{ currentStep }} of {{ totalSteps }}
              </span>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1.5 hover:bg-stone-100 cursor-pointer"
                @click="closeModal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Step content -->
            <div class="px-8 pt-6 pb-8">
              <Transition name="step" mode="out-in">
                <!-- Step 1: Wedding Date -->
                <div v-if="currentStep === 1" key="step1">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                    When's your wedding day?
                  </h2>
                  <p class="text-gray-400 mb-8 text-sm">
                    We'll check venue availability for your date.
                  </p>
                  <input
                    v-model="form.weddingDate"
                    type="date"
                    class="w-full text-lg border-2 border-stone-200 focus:border-rose-400 rounded-2xl px-5 py-4 outline-none transition-colors bg-white"
                    :min="new Date().toISOString().split('T')[0]"
                  />
                </div>

                <!-- Step 2: Guest Count -->
                <div v-else-if="currentStep === 2" key="step2">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                    How many guests are you expecting?
                  </h2>
                  <p class="text-gray-400 mb-8 text-sm">
                    An estimate is fine — you can refine this later.
                  </p>
                  <div class="relative">
                    <input
                      v-model.number="form.guestCount"
                      type="number"
                      min="1"
                      max="2000"
                      placeholder="e.g. 120"
                      class="w-full text-2xl font-medium border-2 border-stone-200 focus:border-rose-400 rounded-2xl px-5 py-4 outline-none transition-colors bg-white"
                    />
                    <span class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">guests</span>
                  </div>
                  <!-- Quick options -->
                  <div class="flex flex-wrap gap-2 mt-4">
                    <button
                      v-for="n in [50, 80, 100, 120, 150, 200]"
                      :key="n"
                      type="button"
                      class="px-4 py-2 text-sm rounded-full border-2 transition-all cursor-pointer"
                      :class="form.guestCount === n
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-stone-200 text-gray-600 hover:border-gray-400'"
                      @click="form.guestCount = n"
                    >
                      {{ n }}
                    </button>
                  </div>
                </div>

                <!-- Step 3: Budget Range -->
                <div v-else-if="currentStep === 3" key="step3">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                    What's your total budget?
                  </h2>
                  <p class="text-gray-400 mb-8 text-sm">
                    Include venue hire and catering in your estimate.
                  </p>
                  <div class="space-y-3">
                    <button
                      v-for="opt in budgetOptions"
                      :key="opt.value"
                      type="button"
                      class="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between"
                      :class="form.budgetRange === opt.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-stone-200 text-gray-700 hover:border-gray-400 bg-white'"
                      @click="form.budgetRange = opt.value"
                    >
                      <span class="font-medium">{{ opt.label }}</span>
                      <svg
                        v-if="form.budgetRange === opt.value"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Step 4: Preferred Location -->
                <div v-else-if="currentStep === 4" key="step4">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                    Where would you like to get married?
                  </h2>
                  <p class="text-gray-400 mb-8 text-sm">
                    We're starting with Cape Town and Western Cape venues.
                  </p>
                  <div class="space-y-3">
                    <button
                      v-for="opt in locationOptions"
                      :key="opt.value"
                      type="button"
                      class="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between"
                      :class="form.location === opt.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-stone-200 text-gray-700 hover:border-gray-400 bg-white'"
                      @click="form.location = opt.value"
                    >
                      <span class="font-medium">{{ opt.label }}</span>
                      <svg
                        v-if="form.location === opt.value"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Step 5: Name + Email -->
                <div v-else-if="currentStep === 5" key="step5">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                    Almost there — who are we matching for?
                  </h2>
                  <p class="text-gray-400 mb-8 text-sm">
                    We'll send your matched venues straight to your inbox. No spam, ever.
                  </p>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Your name
                      </label>
                      <input
                        v-model="form.name"
                        type="text"
                        placeholder="e.g. Sarah & James"
                        class="w-full text-base border-2 border-stone-200 focus:border-rose-400 rounded-2xl px-5 py-4 outline-none transition-colors bg-white"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Email address
                      </label>
                      <input
                        v-model="form.email"
                        type="email"
                        placeholder="you@email.com"
                        class="w-full text-base border-2 border-stone-200 focus:border-rose-400 rounded-2xl px-5 py-4 outline-none transition-colors bg-white"
                      />
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- Navigation buttons -->
              <div class="flex items-center justify-between mt-8">
                <button
                  v-if="currentStep > 1"
                  class="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center gap-1"
                  @click="prevStep"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div v-else />

                <button
                  class="flex items-center gap-2 font-medium text-base px-7 py-3.5 rounded-full transition-all duration-200 cursor-pointer"
                  :class="canAdvance
                    ? 'bg-gray-900 text-white hover:bg-gray-700 shadow-md'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'"
                  :disabled="!canAdvance || isSubmitting"
                  @click="nextStep"
                >
                  <span>{{ currentStep === totalSteps ? 'See My Venues' : 'Continue' }}</span>
                  <svg
                    v-if="!isSubmitting"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.97) translateY(8px);
  opacity: 0;
}

/* Step transition */
.step-enter-active,
.step-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
