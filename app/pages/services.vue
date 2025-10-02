<script setup lang="ts">
// Service provider categories for weddings
const serviceCategories = [
  {
    id: 'photographers',
    name: 'Photography & Videography',
    icon: 'i-heroicons-camera',
    description: 'Capture your special moments',
    providers: [
      {
        id: 1,
        name: 'Moments Photography',
        description: 'Award-winning wedding photographers specializing in candid and artistic shots',
        rating: 4.9,
        reviewCount: 127,
        priceRange: 'R8,000 - R15,000',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=300&fit=crop',
        location: 'Johannesburg, Gauteng',
        verified: true
      },
      {
        id: 2,
        name: 'Forever Films',
        description: 'Cinematic wedding videography that tells your unique love story',
        rating: 4.8,
        reviewCount: 98,
        priceRange: 'R12,000 - R20,000',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=300&fit=crop',
        location: 'Cape Town, Western Cape',
        verified: true
      },
      {
        id: 3,
        name: 'Lens & Light Studios',
        description: 'Professional photography and videography packages for your big day',
        rating: 4.7,
        reviewCount: 85,
        priceRange: 'R10,000 - R18,000',
        image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500&h=300&fit=crop',
        location: 'Durban, KwaZulu-Natal',
        verified: false
      }
    ]
  },
  {
    id: 'catering',
    name: 'Catering & Food Services',
    icon: 'i-heroicons-cake',
    description: 'Delicious menus for your celebration',
    providers: [
      {
        id: 4,
        name: 'Gourmet Affairs',
        description: 'Exquisite catering with customizable menus for any wedding style',
        rating: 4.9,
        reviewCount: 156,
        priceRange: 'R350 - R600 per person',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500&h=300&fit=crop',
        location: 'Johannesburg, Gauteng',
        verified: true
      },
      {
        id: 5,
        name: 'Savory Celebrations',
        description: 'Farm-to-table wedding catering with seasonal ingredients',
        rating: 4.8,
        reviewCount: 142,
        priceRange: 'R300 - R500 per person',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&h=300&fit=crop',
        location: 'Cape Town, Western Cape',
        verified: true
      },
      {
        id: 6,
        name: 'Divine Dining',
        description: 'Elegant buffet and plated meal options for weddings of all sizes',
        rating: 4.6,
        reviewCount: 78,
        priceRange: 'R280 - R450 per person',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
        location: 'Pretoria, Gauteng',
        verified: false
      }
    ]
  },
  {
    id: 'decor',
    name: 'Decor & Styling',
    icon: 'i-heroicons-sparkles',
    description: 'Transform your venue beautifully',
    providers: [
      {
        id: 7,
        name: 'Elegant Events Decor',
        description: 'Full-service wedding decor from ceremony to reception',
        rating: 4.9,
        reviewCount: 134,
        priceRange: 'R15,000 - R50,000',
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&h=300&fit=crop',
        location: 'Johannesburg, Gauteng',
        verified: true
      },
      {
        id: 8,
        name: 'Bloom & Co',
        description: 'Floral arrangements and decor that bring your vision to life',
        rating: 4.8,
        reviewCount: 112,
        priceRange: 'R12,000 - R40,000',
        image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=500&h=300&fit=crop',
        location: 'Cape Town, Western Cape',
        verified: true
      },
      {
        id: 9,
        name: 'Dream Designs',
        description: 'Creative styling for modern and traditional weddings',
        rating: 4.7,
        reviewCount: 89,
        priceRange: 'R10,000 - R35,000',
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&h=300&fit=crop',
        location: 'Durban, KwaZulu-Natal',
        verified: false
      }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Music',
    icon: 'i-heroicons-musical-note',
    description: 'Keep your guests entertained',
    providers: [
      {
        id: 10,
        name: 'DJ Vibes',
        description: 'Professional DJ services with extensive music library',
        rating: 4.8,
        reviewCount: 167,
        priceRange: 'R5,000 - R12,000',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&h=300&fit=crop',
        location: 'Johannesburg, Gauteng',
        verified: true
      },
      {
        id: 11,
        name: 'The Wedding Band',
        description: 'Live band performances for an unforgettable celebration',
        rating: 4.9,
        reviewCount: 145,
        priceRange: 'R15,000 - R30,000',
        image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=300&fit=crop',
        location: 'Cape Town, Western Cape',
        verified: true
      }
    ]
  },
  {
    id: 'planning',
    name: 'Wedding Planners',
    icon: 'i-heroicons-clipboard-document-check',
    description: 'Expert coordination for your big day',
    providers: [
      {
        id: 12,
        name: 'Perfect Day Planning',
        description: 'Full-service wedding planning from concept to execution',
        rating: 5.0,
        reviewCount: 89,
        priceRange: 'R25,000 - R60,000',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&h=300&fit=crop',
        location: 'Johannesburg, Gauteng',
        verified: true
      },
      {
        id: 13,
        name: 'Blissful Weddings',
        description: 'Partial and full wedding planning services',
        rating: 4.9,
        reviewCount: 102,
        priceRange: 'R20,000 - R50,000',
        image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&h=300&fit=crop',
        location: 'Cape Town, Western Cape',
        verified: true
      }
    ]
  },
  {
    id: 'makeup',
    name: 'Hair & Makeup',
    icon: 'i-heroicons-heart',
    description: 'Look stunning on your special day',
    providers: [
      {
        id: 14,
        name: 'Glamour Studio',
        description: 'Bridal hair and makeup with trial sessions',
        rating: 4.9,
        reviewCount: 178,
        priceRange: 'R2,500 - R5,000',
        image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&h=300&fit=crop',
        location: 'Johannesburg, Gauteng',
        verified: true
      },
      {
        id: 15,
        name: 'Beauty by Design',
        description: 'Mobile hair and makeup services for bridal parties',
        rating: 4.8,
        reviewCount: 134,
        priceRange: 'R2,000 - R4,500',
        image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=300&fit=crop',
        location: 'Cape Town, Western Cape',
        verified: true
      }
    ]
  }
];

// Scroll to category section
const scrollToCategory = (categoryId: string) => {
  const element = document.getElementById(categoryId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Wedding Services</h1>
        <p class="text-xl md:text-2xl text-purple-100 max-w-3xl">
          Find trusted professionals to make your wedding day perfect
        </p>
      </div>
    </div>

    <!-- Category Navigation -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex overflow-x-auto gap-4 py-4 no-scrollbar">
          <UButton
            v-for="category in serviceCategories"
            :key="category.id"
            :icon="category.icon"
            variant="ghost"
            size="sm"
            class="whitespace-nowrap"
            @click="scrollToCategory(category.id)"
          >
            {{ category.name }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Service Categories -->
      <div v-for="category in serviceCategories" :key="category.id" :id="category.id" class="mb-16">
        <!-- Category Header -->
        <div class="flex items-center gap-3 mb-6">
          <UIcon :name="category.icon" class="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ category.name }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ category.description }}</p>
          </div>
        </div>

        <!-- Provider Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="provider in category.providers"
            :key="provider.id"
            class="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            <!-- Provider Image -->
            <div class="aspect-video w-full overflow-hidden rounded-lg mb-4">
              <img
                :src="provider.image"
                :alt="provider.name"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <!-- Provider Info -->
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ provider.name }}
                </h3>
                <UBadge v-if="provider.verified" color="primary" variant="subtle" size="xs">
                  <UIcon name="i-heroicons-check-badge" class="w-3 h-3" />
                  Verified
                </UBadge>
              </div>

              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ provider.description }}
              </p>

              <!-- Rating -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400" />
                  <span class="font-semibold text-gray-900 dark:text-white">
                    {{ provider.rating }}
                  </span>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  ({{ provider.reviewCount }} reviews)
                </span>
              </div>

              <!-- Location -->
              <div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                {{ provider.location }}
              </div>

              <!-- Price Range -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span class="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {{ provider.priceRange }}
                </span>
                <UButton size="xs" variant="soft">
                  View Details
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar for category navigation */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Line clamp for description */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
