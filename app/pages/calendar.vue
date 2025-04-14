<script setup lang="ts">
definePageMeta({
  layout: 'dashboard' // This will use layouts/admin.vue
})
const client = useSupabaseClient()

const venues = computed(() => data.value || [])

const { data, error } = await useAsyncData<IVenue[] | null>(
  'venues',
  async () => {
    const { data, error } = await client.from('venues').select()

    if (error) {
      console.error('Error fetching venues:', error)
      return null
    }

    return data || null
  }
)

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="bookings calendar">
    <template #header>
      <UDashboardNavbar title="bookings calendar">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <div>sort</div>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <div class="container mx-auto p-4 max-w-[1228px] mt-28">
            <div
              v-if="venues && venues.length > 0"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -mt-24 gap-8"
            >
              <div
                v-for="venue in venues"
                :key="venue.id.toString()"
                class="group bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] relative"
              >
                <!-- Edit Button - Shows on hover -->
                <div class="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <UButton
                    icon="i-heroicons-pencil-square"
                    color="primary"
                    variant="solid"
                    size="sm"
                    square
                    :ui="{ rounded: 'rounded-full' }"
                    class="shadow-md hover:shadow-lg"
                    :to="`/venues/${venue.id.toString()}/edit`"
                  />
                </div>

                <NuxtLink :to="`/venues/${venue.id.toString()}`" class="block">
                  <div class="relative w-full h-48">
                    <!-- Image -->
                    <NuxtImg
                      :src="
                        venue.photos.length > 0 ? venue.photos[0] : '/default.jpg'
                      "
                      alt="Venue Image"
                      class="w-full h-48 object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
                    />

                    <!-- Light Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span
                        class="text-dark-900 text-lg font-bold text-center bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg transition-all duration-300 hover:bg-white/70"
                      >
                        {{ venue.venue_name }}
                      </span>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
            <div v-else class="text-center">
              Loading venues or no venues available...
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
