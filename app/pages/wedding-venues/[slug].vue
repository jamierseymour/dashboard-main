<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()

interface PageConfig {
  h1: string
  subtitle: string
  intro: string
  body: string
  seoTitle: string
  seoDescription: string
  filterType: 'type' | 'province'
  venueType?: string
  province?: string
  icon: string
  color: string
}

const PAGE_CONFIG: Record<string, PageConfig> = {
  'garden-venues': {
    h1: 'Garden Wedding Venues in South Africa',
    subtitle: 'Celebrate your love surrounded by lush, manicured beauty',
    intro: 'There is something truly magical about saying "I do" in a garden. From rose-lined pathways to sweeping lawns framed by mountains, South Africa\'s garden wedding venues offer breathtaking natural backdrops without sacrificing elegance.',
    body: 'Garden venues are among the most versatile of all wedding settings — they work beautifully for intimate ceremonies of 30 guests as much as lavish celebrations of 300. Many offer a mix of shaded and open areas, allowing your ceremony, cocktail hour, and reception to each have their own distinct feel. Look for venues with established trees for natural shade, good drainage for unpredictable weather, and flexible catering arrangements. The best South African garden venues tend to book out 12–18 months in advance for peak season (September through April), so enquire early.',
    seoTitle: 'Garden Wedding Venues South Africa | Browse & Book a Free Viewing',
    seoDescription: 'Find the perfect garden wedding venue in South Africa. Browse beautiful outdoor venues with lush gardens, manicured grounds, and stunning backdrops. Book a free viewing today.',
    filterType: 'type',
    venueType: 'Garden Venue',
    icon: '🌸',
    color: 'from-green-800 to-green-600',
  },
  'farm-venues': {
    h1: 'Farm Wedding Venues in South Africa',
    subtitle: 'Rustic charm, wide open spaces, and unforgettable celebrations',
    intro: 'Farm weddings are all about atmosphere — golden sunsets, the smell of fresh grass, long wooden tables laden with food, and a sense of warmth that city venues simply cannot replicate. South Africa\'s farm wedding venues range from working wine and wheat farms to boutique country estates, each with a character all their own.',
    body: 'One of the great advantages of a farm venue is space — both for your guests and for the imagination. Many farm venues allow couples to personalise the setting significantly, from custom lighting rigs in barn rafters to outdoor ceremony spots beneath ancient oak trees. Farm venues often come with exclusive-use arrangements meaning your wedding is the only event on the property — giving you and your guests a genuine sense of belonging to the place for the weekend. Consider venues with overnight accommodation on-site so the celebration can continue past midnight without anyone worrying about the drive home.',
    seoTitle: 'Farm Wedding Venues South Africa | Rustic & Country Settings',
    seoDescription: 'Browse farm wedding venues across South Africa. Rustic farm settings with wide open spaces, barn facilities, and authentic country charm. Book a free venue viewing.',
    filterType: 'type',
    venueType: 'Farm Venue',
    icon: '🌾',
    color: 'from-amber-800 to-amber-600',
  },
  'beach-venues': {
    h1: 'Beach Wedding Venues in South Africa',
    subtitle: 'Toes in the sand, vows by the sea',
    intro: 'From the Atlantic Seaboard to the warm waters of KwaZulu-Natal, South Africa offers some of the world\'s most spectacular coastal wedding settings. Imagine the sound of waves as you exchange vows at sunset — with the sky turning shades of orange and pink behind your photographer\'s lens.',
    body: 'Beach weddings require a little extra planning — wind, sand, and sun all need to be factored into your setup — but the payoff in atmosphere and photographs is unmatched. The most experienced beach wedding venues in South Africa have mastered these logistics: from weighted floral installations and sand-stable chairs to backup indoor spaces for unexpected weather. The Western Cape\'s Atlantic coast, the Garden Route\'s Wilderness and Knysna beaches, and the subtropical shores of the KZN North Coast all offer distinctive beach wedding experiences.',
    seoTitle: 'Beach Wedding Venues South Africa | Coastal & Seaside Settings',
    seoDescription: 'Find beach wedding venues in South Africa. Coastal venues with ocean views on the Atlantic Seaboard, Garden Route, and KwaZulu-Natal coast. Book a free viewing.',
    filterType: 'type',
    venueType: 'Beach Venue',
    icon: '🌊',
    color: 'from-blue-800 to-cyan-600',
  },
  'bushveld-venues': {
    h1: 'Bushveld Wedding Venues in South Africa',
    subtitle: 'Exchange vows beneath the vast African sky',
    intro: 'Imagine celebrating your union against an ancient African landscape — red earth, endless sky, and the distant call of wildlife. Bushveld wedding venues offer a genuinely unique South African experience, blending romance with the raw beauty of the bush. These venues are perfect for couples who want their big day to feel adventurous, intimate, and completely unlike anything their guests have attended before.',
    body: 'Bushveld venues are typically found in Limpopo, Mpumalanga, and the North West Province, often adjacent to or within private game reserves. This means your wedding weekend can include a sunrise game drive, bush sundowners, and boma dinners under a blanket of stars. Guest numbers tend to be smaller at these venues — which is part of their appeal. If you\'ve always dreamed of a wedding that doubles as a bucket-list experience for every single guest, a bushveld venue should be at the top of your list.',
    seoTitle: 'Bushveld Wedding Venues South Africa | Safari & Bush Settings',
    seoDescription: 'Discover bushveld and safari wedding venues in South Africa. Experience the magic of the African bush on your wedding day. Browse venues and book a free viewing.',
    filterType: 'type',
    venueType: 'Bushveld Venue',
    icon: '🦁',
    color: 'from-orange-900 to-orange-700',
  },
  'country-venues': {
    h1: 'Country Wedding Venues in South Africa',
    subtitle: 'Timeless charm and the peaceful beauty of the countryside',
    intro: 'Country wedding venues offer a sense of space, serenity, and style that is hard to find elsewhere. Rolling hills, stone farmhouses, sweeping driveways, and the unhurried pace of rural life create the perfect backdrop for a wedding that feels both grand and deeply personal.',
    body: 'The appeal of a country wedding venue lies in its ability to feel simultaneously elegant and relaxed. Guests arrive and immediately slow down — there\'s nowhere to rush to, nothing to distract from the celebration at hand. Many of South Africa\'s finest country venues are historic properties, with architecture that provides a ready-made sense of occasion. Look for venues that offer accommodation on the estate so guests can settle in the night before and enjoy the morning-after brunch that is such an essential part of a country wedding experience.',
    seoTitle: 'Country Wedding Venues South Africa | Rural & Estate Settings',
    seoDescription: 'Browse country wedding venues across South Africa. Beautiful rural estates, manor houses, and countryside properties for your perfect wedding. Book a free viewing today.',
    filterType: 'type',
    venueType: 'Country Venue',
    icon: '🏡',
    color: 'from-lime-800 to-lime-600',
  },
  'forest-venues': {
    h1: 'Forest Wedding Venues in South Africa',
    subtitle: 'A fairytale setting beneath towering indigenous trees',
    intro: 'There is an undeniable magic to getting married in a forest. Dappled light through ancient canopies, the cool green stillness, birdsong as your wedding soundtrack — forest wedding venues create an atmosphere that no ballroom can match. South Africa\'s indigenous forests are among the most beautiful in the world.',
    body: 'The Knysna Forest, the forests of the Tsitsikamma, and the Afromontane woodlands of the Drakensberg foothills all host extraordinary wedding venues. Forest ceremonies tend to be on the more intimate side — which suits couples who value atmosphere and authenticity over scale. Practical considerations include the availability of permits for large events, the potential for uneven ground (important for elderly guests), and ensuring your sound system can project clearly in an outdoor, acoustically complex environment. A good forest venue coordinator will have answers to all of these questions ready.',
    seoTitle: 'Forest Wedding Venues South Africa | Woodland & Nature Settings',
    seoDescription: 'Find forest wedding venues in South Africa. Magical woodland settings beneath indigenous trees. Browse venues near Knysna, Garden Route, and beyond. Book a free viewing.',
    filterType: 'type',
    venueType: 'Forest Venue',
    icon: '🌲',
    color: 'from-emerald-900 to-emerald-700',
  },
  'city-venues': {
    h1: 'City Wedding Venues in South Africa',
    subtitle: 'Sophisticated urban celebrations with a skyline backdrop',
    intro: 'City wedding venues offer something the countryside cannot — energy, convenience, and a certain urban sophistication. From Cape Town\'s iconic waterfront to Johannesburg\'s rooftop terraces and boutique hotels, South Africa\'s cities are full of stunning spaces for modern, stylish weddings.',
    body: 'City venues are particularly well-suited to larger weddings with guest lists that include people travelling from different cities or countries, since accommodation, airports, and entertainment are all within easy reach. They also lend themselves to a style of wedding that leans into the contemporary — think clean lines, statement florals, and menus that reflect the restaurant-quality dining available in urban South Africa. Many city venues offer an all-in-one experience: ceremony space, cocktail terrace, and reception hall in the same building, which simplifies logistics considerably.',
    seoTitle: 'City Wedding Venues South Africa | Urban & Modern Settings',
    seoDescription: 'Browse city wedding venues in South Africa. Elegant urban spaces in Cape Town, Johannesburg, Durban, and more. Book a free venue viewing for your wedding.',
    filterType: 'type',
    venueType: 'City Venue',
    icon: '🏙️',
    color: 'from-slate-800 to-slate-600',
  },
  'wine-farm-venues': {
    h1: 'Wine Farm Wedding Venues in South Africa',
    subtitle: 'Romance among the vines in the Cape Winelands and beyond',
    intro: 'South Africa is home to some of the world\'s most celebrated wine regions — and its wine farm wedding venues are just as extraordinary. Set against mountain backdrops, with rows of perfectly tended vines and centuries-old Cape Dutch architecture, these venues combine natural grandeur with sophisticated elegance.',
    body: 'A wine farm wedding means world-class food, exceptional wine, and a setting that photographs stunningly in every season. Spring brings wildflowers among the vines; summer delivers long golden evenings; autumn turns the vineyards amber and red; and even winter has its moody charm. Most wine farm venues have in-house catering operations producing menus centred on estate-grown produce and, of course, their own wine. The Stellenbosch, Franschhoek, and Paarl wine routes all have exceptional venue options, and the competition between estates has driven quality to extraordinary heights.',
    seoTitle: 'Wine Farm Wedding Venues South Africa | Cape Winelands Settings',
    seoDescription: 'Discover wine farm wedding venues in South Africa. Cape Winelands settings with mountain views, vineyards, and Cape Dutch architecture. Book a free viewing.',
    filterType: 'type',
    venueType: 'Wine Farm Venue',
    icon: '🍇',
    color: 'from-purple-900 to-purple-700',
  },
  'western-cape': {
    h1: 'Wedding Venues in the Western Cape',
    subtitle: "South Africa's most sought-after wedding destination",
    intro: 'The Western Cape is South Africa\'s premier wedding destination — and for good reason. Within a two-hour drive of Cape Town you\'ll find everything from dramatic mountain escapes and pristine Atlantic beaches to world-famous wine estates, lush forest clearings, and garden venues overlooking rolling valleys.',
    body: 'The Western Cape\'s diversity is its greatest asset as a wedding destination. Couples can choose between the cosmopolitan energy of Cape Town\'s V&A Waterfront, the timeless romance of a Franschhoek wine estate, the dramatic cliffs of the Cape Peninsula, the forested banks of the Garden Route, or the wide cereal farmlands of the Overberg. The region also has excellent infrastructure for wedding guests — international flights into Cape Town International, a wide range of accommodation at every price point, and some of the country\'s finest restaurants for the night before and after the big day. The Western Cape wedding season peaks between October and April, coinciding with warm, dry weather and long sunny evenings.',
    seoTitle: 'Wedding Venues Western Cape | Cape Town, Winelands & Garden Route',
    seoDescription: 'Find the perfect wedding venue in the Western Cape. Browse Cape Town, Stellenbosch, Franschhoek, Hermanus, and Garden Route venues. Book a free viewing today.',
    filterType: 'province',
    province: 'Western Cape',
    icon: '🏔️',
    color: 'from-rose-900 to-rose-700',
  },
}

const slug = route.params.slug as string
const config = PAGE_CONFIG[slug]

if (!config) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useSeoMeta({
  title: config.seoTitle,
  description: config.seoDescription,
  ogTitle: config.seoTitle,
  ogDescription: config.seoDescription,
  twitterCard: 'summary_large_image',
})

interface IVenue {
  id: string
  photos: string[]
  venue_name: string
  max_capacity: number | null
  city: string | null
  price: number | null
  venue_type: string | null
  state_province: string | null
  selected_province: string | null
  formatted_address: string | null
}

const { data: venues, status } = useAsyncData<IVenue[]>(
  `landing-${slug}`,
  async () => {
    let query = client
      .from('venues')
      .select('id, photos, venue_name, max_capacity, city, price, venue_type, state_province, selected_province, formatted_address')
      .order('id', { ascending: false })

    if (config.filterType === 'type' && config.venueType) {
      query = query.eq('venue_type', config.venueType).limit(24)
    }
    else {
      // Province pages: fetch broadly and filter client-side
      // (state_province may be JSON-encoded, so text search is unreliable server-side)
      query = query.limit(200)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching venues:', error)
      return []
    }

    if (config.filterType === 'province' && config.province) {
      const search = config.province.toLowerCase()
      return (data || []).filter((v) => {
        return (
          (v.formatted_address || '').toLowerCase().includes(search)
          || (v.state_province || '').toLowerCase().includes(search)
          || (v.selected_province || '').toLowerCase().includes(search)
          || (v.city || '').toLowerCase().includes(search)
        )
      })
    }

    return data || []
  },
  { default: () => [] },
)

const loading = computed(() => status.value === 'pending')

// All other landing pages for internal linking
const relatedPages = Object.entries(PAGE_CONFIG)
  .filter(([key]) => key !== slug)
  .map(([key, val]) => ({ slug: key, icon: val.icon, label: val.h1.replace(' in South Africa', '').replace(' in the ', ' in ') }))
</script>

<template>
  <div>
    <!-- Hero -->
    <section :class="`bg-gradient-to-br ${config.color} text-white`">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div class="text-5xl mb-5">{{ config.icon }}</div>
        <h1 class="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
          {{ config.h1 }}
        </h1>
        <p class="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          {{ config.subtitle }}
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <UButton size="xl" color="white" variant="solid" to="/venues" class="cursor-pointer">
            Search all venues
          </UButton>
          <UButton size="xl" color="white" variant="outline" to="/new-venue" class="cursor-pointer">
            List your venue
          </UButton>
        </div>
      </div>
    </section>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex items-center gap-2 text-sm text-gray-500">
          <NuxtLink to="/" class="hover:text-gray-900">Home</NuxtLink>
          <span>/</span>
          <NuxtLink to="/venues" class="hover:text-gray-900">Wedding Venues</NuxtLink>
          <span>/</span>
          <span class="text-gray-900 font-medium">{{ config.h1 }}</span>
        </nav>
      </div>
    </div>

    <!-- Venue grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        {{ loading ? 'Loading venues…' : `${venues?.length || 0} ${config.venueType ? config.venueType.toLowerCase() + 's' : 'venues in the ' + config.province}` }}
      </h2>
      <p class="text-gray-500 mb-8 text-sm">Browse and book a free viewing — no payment required</p>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        <div v-for="n in 6" :key="n" class="animate-pulse">
          <div class="w-full aspect-square bg-gray-200 rounded-xl mb-3" />
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div class="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>

      <!-- Grid -->
      <div
        v-else-if="venues && venues.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
      >
        <NuxtLink
          v-for="venue in venues"
          :key="venue.id"
          :to="`/venues/${venue.id}`"
          class="block group"
        >
          <div class="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gray-100">
            <NuxtImg
              :src="venue.photos?.[0] || '/default.jpg'"
              :alt="venue.venue_name"
              class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <h3 class="font-semibold text-[15px] text-gray-900 mb-1 truncate">
            {{ venue.venue_name }}
          </h3>
          <div class="flex justify-between text-gray-500 text-[13px] gap-1">
            <span v-if="venue.max_capacity">Up to {{ venue.max_capacity }} pax</span>
            <span v-if="venue.city" class="truncate text-right">{{ venue.city }}</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-16">
        <p class="text-gray-500 text-lg mb-4">No venues listed yet in this category.</p>
        <UButton to="/venues" variant="outline" color="primary" class="cursor-pointer">
          Browse all venues
        </UButton>
      </div>
    </section>

    <!-- About content (SEO) -->
    <section class="bg-gray-50 py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-5">
          About {{ config.h1 }}
        </h2>
        <p class="text-gray-600 leading-relaxed text-lg mb-6">
          {{ config.intro }}
        </p>
        <p class="text-gray-600 leading-relaxed">
          {{ config.body }}
        </p>

        <div class="mt-10 flex flex-wrap gap-4">
          <UButton size="lg" color="primary" to="/venues" class="cursor-pointer">
            Browse all venues
          </UButton>
          <UButton size="lg" color="primary" variant="outline" to="/new-venue" class="cursor-pointer">
            List your venue for free
          </UButton>
        </div>
      </div>
    </section>

    <!-- Internal links to related pages -->
    <section class="py-14 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
          Explore other venue categories
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <NuxtLink
            v-for="page in relatedPages"
            :key="page.slug"
            :to="`/wedding-venues/${page.slug}`"
            class="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
          >
            <span class="text-xl">{{ page.icon }}</span>
            <span class="text-sm font-medium text-gray-700 group-hover:text-purple-700 leading-tight">
              {{ page.label }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
