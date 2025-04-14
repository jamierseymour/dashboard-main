<template>
  <div class="w-full">
    <GMapAutocomplete
      placeholder="Enter an address"
      class="address-input"
      @place_changed="setPlace"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface PlaceResult {
  formatted_address?: string
  geometry?: {
    location?: {
      lat: () => number
      lng: () => number
    }
  }
  place_id?: string
  name?: string
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

interface EmitEvents {
  (event: 'place-selected', place: PlaceResult): void
}

const emit = defineEmits<EmitEvents>()
const selectedPlace = ref<PlaceResult | null>(null)

const setPlace = (place: PlaceResult): void => {
  selectedPlace.value = place
  emit('place-selected', place)
}
</script>

<style scoped>
.address-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
