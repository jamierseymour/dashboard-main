<script setup lang="ts">
import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'
import { BUDGET_RANGES, SA_PROVINCES, useEventSearch } from '~/composables/useEventSearch'

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

// Sticky CTA visibility
const heroPassed = ref(false)
const heroRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => { heroPassed.value = !entries[0]?.isIntersecting },
    { threshold: 0 },
  )
  if (heroRef.value) observer.observe(heroRef.value)
  onUnmounted(() => observer.disconnect())
})

// Form data
const form = reactive({
  weddingDate: '',
  guestCount: null as number | null,
  budgetRange: '',
  location: '',
  name: '',
  email: '',
})

// Date picker
const todayDate = today(getLocalTimeZone())
const weddingDateValue = ref<DateValue | undefined>(undefined)
watch(weddingDateValue, (val) => {
  if (val) {
    form.weddingDate = `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`
  }
  else {
    form.weddingDate = ''
  }
})
function isDateDisabled(date: DateValue) {
  return date.compare(todayDate) < 0
}

const budgetOptions = BUDGET_RANGES.map(b => ({ label: b.label, value: b.value }))
const locationOptions = SA_PROVINCES.map(p => ({ label: p, value: p }))

// Progress fills after the current step completes
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

// Auto-advance single-choice steps (3 & 4) after a short delay
function selectBudget(value: string) {
  form.budgetRange = value
  setTimeout(() => nextStep(), 220)
}

function selectLocation(value: string) {
  form.location = value
  setTimeout(() => nextStep(), 220)
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

const stats = [
  { value: '300+', label: 'Venues listed' },
  { value: '1,200+', label: 'Couples matched' },
  { value: 'Free', label: 'To enquire' },
]

const painPoints = [
  {
    title: 'Misleading "starting from" prices',
    path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Weeks of email back and forth',
    path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'Viewings outside your budget',
    path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
]

const howItWorks = [
  { n: '1', title: 'Enter your date & guest count' },
  { n: '2', title: 'Set your total budget' },
  { n: '3', title: 'Compare matched venues & book a viewing' },
]
</script>

<template>
  <div class="bg-white">

    <!-- ─── SECTION 1: HERO ─────────────────────────────────────────── -->
    <section ref="heroRef" class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div class="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-12 xl:gap-20 items-center">

          <!-- Left -->
          <div class="max-w-2xl">
            <p class="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-rose-500 uppercase mb-6">
              <span class="w-4 h-px bg-rose-400" />
              🇿🇦 Built for South African Couples
            </p>

            <h1 class="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-semibold leading-[1.08] text-gray-900 mb-6 tracking-tight">
              Find Your Wedding Venue —
              <span class="text-rose-500"> Without the Pricing Guesswork</span>
            </h1>

            <p class="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg">
              We help you confidently shortlist your venue. Tell us your date, guest count and budget — we'll show you venues that actually fit.
            </p>

            <!-- Primary CTA -->
            <button
              class="group relative inline-flex items-center gap-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-lg px-10 py-5 rounded-full transition-all duration-200 shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-0.5 cursor-pointer"
              @click="openModal"
            >
              Find My Matching Venues
              <svg class="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <!-- Trust micro-chips -->
            <div class="flex flex-wrap gap-4 mt-5">
              <span v-for="chip in ['Takes 60 seconds', 'No spam', 'Free to use']" :key="chip" class="flex items-center gap-1.5 text-sm text-gray-400">
                <svg class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                {{ chip }}
              </span>
            </div>
          </div>

          <!-- Right: Image -->
          <div class="relative hidden lg:block">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/4]">
              <img
                src="/images/find/hero.png"
                alt="Elegant wedding venue"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </div>
            <!-- Floating cost badge -->
            <div class="absolute -bottom-5 -left-8 bg-white rounded-2xl shadow-xl px-5 py-4 border border-stone-100 max-w-[220px]">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Est. for 120 guests</p>
              <p class="text-lg font-semibold text-gray-900 leading-tight">R165,000 – R190,000</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 2: PROBLEM ──────────────────────────────────────── -->
    <section class="bg-stone-50 py-20 lg:py-24">
      <div class="max-w-5xl mx-auto px-6 lg:px-12">
        <div class="max-w-xl mb-12">
          <h2 class="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Finally, Wedding Venue Clarity.
          </h2>
          <p class="text-lg text-gray-500 leading-relaxed">
            Most couples spend weeks chasing quotes — only to discover the venue is out of their budget. That ends here.
          </p>
        </div>

        <div class="grid sm:grid-cols-3 gap-5">
          <div
            v-for="p in painPoints"
            :key="p.title"
            class="bg-white rounded-2xl px-7 py-6 shadow-sm border border-stone-100 flex items-start gap-4"
          >
            <div class="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="p.path" />
              </svg>
            </div>
            <p class="font-medium text-gray-800 text-sm leading-snug">{{ p.title }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 3: SOLUTION ─────────────────────────────────────── -->
    <section class="py-20 lg:py-24">
      <div class="max-w-5xl mx-auto px-6 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 class="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
              Compare Real Estimated Costs Upfront
            </h2>
            <p class="text-lg text-gray-500 leading-relaxed mb-8">
              Every venue shows a transparent cost breakdown — venue hire, per-head catering, seasonal variation, and minimum spend — before you book a single viewing.
            </p>

            <!-- 3 stat anchors -->
            <div class="grid grid-cols-3 gap-4 mb-10">
              <div v-for="s in [{ n: 'R750', l: 'avg. per head' }, { n: 'R45k', l: 'avg. venue hire' }, { n: '±5%', l: 'seasonal range' }]" :key="s.n" class="text-center bg-stone-50 rounded-2xl py-4 border border-stone-100">
                <p class="text-xl font-semibold text-gray-900">{{ s.n }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ s.l }}</p>
              </div>
            </div>

            <button
              class="inline-flex items-center gap-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-200 shadow-md shadow-rose-200 hover:shadow-rose-300 cursor-pointer"
              @click="openModal"
            >
              Start Matching
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          <!-- Estimate card -->
          <div class="bg-stone-50 rounded-3xl p-7 border border-stone-100">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-5">Example estimate</p>
            <div class="space-y-0 mb-5 divide-y divide-stone-200">
              <div v-for="row in [{ l: 'Venue hire', v: 'R45,000' }, { l: 'Catering — 120 pax × R750', v: 'R90,000' }, { l: 'Seasonal adjustment', v: '+5%' }]" :key="row.l" class="flex justify-between items-center py-3.5">
                <span class="text-sm text-gray-500">{{ row.l }}</span>
                <span class="font-medium text-gray-900 text-sm">{{ row.v }}</span>
              </div>
            </div>
            <div class="bg-white rounded-2xl px-5 py-4 shadow-sm border border-stone-100">
              <p class="text-xs text-gray-400 mb-1">Estimated total for 120 guests</p>
              <p class="text-2xl font-semibold text-gray-900">R165,000 – R190,000</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 4: HOW IT WORKS ─────────────────────────────────── -->
    <section class="bg-stone-50 py-20 lg:py-24">
      <div class="max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <h2 class="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
          How It Works
        </h2>
        <p class="text-lg text-gray-500 mb-14">
          Three questions. Your shortlist — with real pricing.
        </p>

        <div class="flex flex-col sm:flex-row gap-0 sm:gap-0 relative">
          <!-- Connector -->
          <div class="hidden sm:block absolute top-5 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-stone-200" />

          <div
            v-for="(step, i) in howItWorks"
            :key="step.n"
            class="flex-1 flex flex-col items-center px-6"
            :class="i < howItWorks.length - 1 ? 'mb-10 sm:mb-0' : ''"
          >
            <div class="w-10 h-10 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center mb-4 relative z-10">
              {{ step.n }}
            </div>
            <p class="font-medium text-gray-800 text-sm text-center leading-snug">{{ step.title }}</p>
          </div>
        </div>

        <button
          class="mt-14 inline-flex items-center gap-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-200 shadow-md shadow-rose-200 hover:shadow-rose-300 cursor-pointer"
          @click="openModal"
        >
          Get Started — It's Free
        </button>
      </div>
    </section>

    <!-- ─── SECTION 5: TRUST ─────────────────────────────────────────── -->
    <section class="py-20 lg:py-24">
      <div class="max-w-5xl mx-auto px-6 lg:px-12">

        <!-- Stat bar -->
        <div class="grid grid-cols-3 gap-px bg-stone-100 rounded-2xl overflow-hidden mb-14 border border-stone-100">
          <div
            v-for="s in stats"
            :key="s.value"
            class="bg-white text-center py-7 px-4"
          >
            <p class="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">{{ s.value }}</p>
            <p class="text-sm text-gray-400">{{ s.label }}</p>
          </div>
        </div>

        <div class="text-center mb-10">
          <h2 class="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            Trusted by Couples Across Cape Town
          </h2>
        </div>

        <!-- Testimonials -->
        <div class="grid sm:grid-cols-2 gap-5">
          <div
            v-for="t in testimonials"
            :key="t.name"
            class="bg-stone-50 rounded-2xl p-7 border border-stone-100"
          >
            <div class="flex gap-0.5 mb-4">
              <svg v-for="n in 5" :key="n" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p class="text-gray-700 leading-relaxed mb-5 italic text-sm">"{{ t.quote }}"</p>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ t.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ t.location }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── SECTION 6: FINAL CTA ─────────────────────────────────────── -->
    <section class="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 py-20 lg:py-28">
      <!-- Soft texture overlay -->
      <div class="absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px;" />

      <div class="relative max-w-2xl mx-auto px-6 lg:px-12 text-center">
        <h2 class="text-3xl sm:text-4xl font-semibold text-white mb-4 tracking-tight">
          Ready to See Venues That Fit?
        </h2>
        <p class="text-lg text-rose-100 mb-10">
          Join couples across Cape Town who found their venue — and their budget clarity — in under 60 seconds.
        </p>
        <button
          class="inline-flex items-center gap-3 bg-white hover:bg-stone-50 text-gray-900 font-semibold text-lg px-10 py-5 rounded-full transition-all duration-200 shadow-xl hover:-translate-y-0.5 cursor-pointer"
          @click="openModal"
        >
          Find My Matching Venues
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        <p class="mt-4 text-sm text-rose-200">No spam. No obligation. Takes 60 seconds.</p>
      </div>
    </section>

    <!-- ─── FOOTER ───────────────────────────────────────────────────── -->
    <AppFooter />

    <!-- ─── STICKY MOBILE CTA ────────────────────────────────────────── -->
    <Transition name="sticky">
      <div
        v-if="heroPassed"
        class="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-stone-100 px-4 py-3 shadow-lg"
      >
        <button
          class="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-base py-3.5 rounded-2xl shadow-md cursor-pointer"
          @click="openModal"
        >
          Find My Matching Venues
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- ─── 5-STEP QUESTIONNAIRE MODAL ──────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          @keydown="handleKeydown"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />

          <!-- Panel -->
          <div
            class="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
            @click.stop
          >
            <!-- Progress bar -->
            <div class="h-1 bg-stone-100">
              <div
                class="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500 ease-out"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>

            <!-- Header -->
            <div class="flex items-center justify-between px-7 pt-6 pb-1">
              <span class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Step {{ currentStep }} of {{ totalSteps }}
              </span>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1.5 hover:bg-stone-100 cursor-pointer"
                aria-label="Close"
                @click="closeModal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Step content -->
            <div class="px-7 pt-5 pb-7">
              <Transition name="step" mode="out-in">

                <!-- Step 1: Date -->
                <div v-if="currentStep === 1" key="step1">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-1.5">When's your wedding day?</h2>
                  <p class="text-sm text-gray-400 mb-7">We'll check venue availability for your date.</p>
                  <UCalendar
                    v-model="weddingDateValue"
                    :is-date-disabled="isDateDisabled"
                    class="w-full rounded-2xl border-2 border-stone-200"
                  />
                </div>

                <!-- Step 2: Guest count -->
                <div v-else-if="currentStep === 2" key="step2">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-1.5">How many guests?</h2>
                  <p class="text-sm text-gray-400 mb-7">An estimate is fine — you can refine this later.</p>
                  <div class="relative mb-4">
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
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="n in [50, 80, 100, 120, 150, 200]"
                      :key="n"
                      type="button"
                      class="px-4 py-2 text-sm rounded-full border-2 transition-all cursor-pointer font-medium"
                      :class="form.guestCount === n
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-stone-200 text-gray-500 hover:border-gray-400'"
                      @click="form.guestCount = n"
                    >
                      {{ n }}
                    </button>
                  </div>
                </div>

                <!-- Step 3: Budget — auto-advances on select -->
                <div v-else-if="currentStep === 3" key="step3">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-1.5">What's your total budget?</h2>
                  <p class="text-sm text-gray-400 mb-7">Include venue hire and catering.</p>
                  <div class="space-y-2.5">
                    <button
                      v-for="opt in budgetOptions"
                      :key="opt.value"
                      type="button"
                      class="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between font-medium text-sm"
                      :class="form.budgetRange === opt.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-stone-200 text-gray-700 hover:border-gray-400 bg-white'"
                      @click="selectBudget(opt.value)"
                    >
                      {{ opt.label }}
                      <svg v-if="form.budgetRange === opt.value" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Step 4: Location — auto-advances on select -->
                <div v-else-if="currentStep === 4" key="step4">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-1.5">Where would you like to get married?</h2>
                  <p class="text-sm text-gray-400 mb-7">Starting with Cape Town & Western Cape.</p>
                  <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <button
                      v-for="opt in locationOptions"
                      :key="opt.value"
                      type="button"
                      class="w-full text-left px-5 py-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between font-medium text-sm"
                      :class="form.location === opt.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-stone-200 text-gray-700 hover:border-gray-400 bg-white'"
                      @click="selectLocation(opt.value)"
                    >
                      {{ opt.label }}
                      <svg v-if="form.location === opt.value" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Step 5: Name + Email -->
                <div v-else-if="currentStep === 5" key="step5">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-1.5">Almost there.</h2>
                  <p class="text-sm text-gray-400 mb-7">We'll send your matched venues straight to your inbox.</p>
                  <div class="space-y-3.5">
                    <div>
                      <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Your name</label>
                      <input
                        v-model="form.name"
                        type="text"
                        placeholder="e.g. Sarah & James"
                        class="w-full text-base border-2 border-stone-200 focus:border-rose-400 rounded-2xl px-5 py-3.5 outline-none transition-colors bg-white"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email address</label>
                      <input
                        v-model="form.email"
                        type="email"
                        placeholder="you@email.com"
                        class="w-full text-base border-2 border-stone-200 focus:border-rose-400 rounded-2xl px-5 py-3.5 outline-none transition-colors bg-white"
                      />
                    </div>
                  </div>
                </div>

              </Transition>

              <!-- Nav -->
              <div class="flex items-center justify-between mt-7">
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

                <!-- Hide Continue on auto-advance steps unless manually needed -->
                <button
                  v-if="currentStep !== 3 && currentStep !== 4"
                  class="flex items-center gap-2 font-semibold text-base px-7 py-3.5 rounded-full transition-all duration-200 cursor-pointer"
                  :class="canAdvance
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md hover:shadow-rose-300 hover:from-rose-600 hover:to-pink-700'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'"
                  :disabled="!canAdvance || isSubmitting"
                  @click="nextStep"
                >
                  <span>{{ currentStep === totalSteps ? 'See My Venues' : 'Continue' }}</span>
                  <svg v-if="!isSubmitting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </button>

                <!-- Steps 3 & 4: tap to select auto-advances, show skip -->
                <button
                  v-else
                  class="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer underline underline-offset-2"
                  @click="nextStep"
                >
                  Skip
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
/* Modal */
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
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.modal-enter-from .relative {
  transform: translateY(24px) scale(0.97);
  opacity: 0;
}
.modal-leave-to .relative {
  transform: translateY(8px) scale(0.97);
  opacity: 0;
}

/* Step slide */
.step-enter-active,
.step-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(14px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-14px);
}

/* Sticky CTA */
.sticky-enter-active,
.sticky-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.sticky-enter-from,
.sticky-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
