<script setup lang="ts">
interface Amenities {
  air_conditioning?: boolean;
  bar?: boolean;
  chairs?: number;
  custom_amenities?: string[];
  dance_floor?: boolean;
  heating?: boolean;
  indoor_space?: boolean;
  kitchen?: boolean;
  lighting?: boolean;
  microphone?: boolean;
  outdoor_space?: boolean;
  projector?: boolean;
  sound_system?: boolean;
  stage?: boolean;
  tables?: number;
  wifi?: boolean;
  [key: string]: any;
}

const props = defineProps<{
  amenities: Amenities;
}>();

// Map of amenities to their corresponding icons
const amenityIcons = {
  air_conditioning: "ph:wind",
  bar: "mdi:glass-cocktail",
  chairs: "mdi:chair-rolling",
  dance_floor: "mdi:dance-ballroom",
  heating: "mdi:radiator",
  indoor_space: "mdi:home",
  kitchen: "mdi:silverware-fork-knife",
  lighting: "mdi:ceiling-light",
  microphone: "mdi:microphone",
  outdoor_space: "mdi:tree",
  projector: "mdi:projector",
  sound_system: "mdi:speaker",
  stage: "mdi:spotlight",
  tables: "mdi:table-furniture",
  wifi: "mdi:wifi",
  custom: "mdi:star", // Default icon for custom amenities
};

// Get only true amenities including custom ones
const trueAmenities = computed(() => {
  const result = [];

  // Add standard amenities that are true or have a value
  for (const [key, value] of Object.entries(props.amenities)) {
    if (key === "custom_amenities") continue;

    // Only include if boolean is true or number is greater than 0
    if (
      (typeof value === "boolean" && value === true) ||
      (typeof value === "number" && value > 0)
    ) {
      result.push({
        name: key.replace(/_/g, " "),
        value: value,
        icon: amenityIcons[key] || "mdi:check",
        isCustom: false,
      });
    }
  }

  // Add custom amenities
  if (
    props.amenities.custom_amenities &&
    Array.isArray(props.amenities.custom_amenities)
  ) {
    for (const customAmenity of props.amenities.custom_amenities) {
      result.push({
        name: customAmenity,
        value: true,
        icon: amenityIcons.custom,
        isCustom: true,
      });
    }
  }

  return result;
});
</script>

<template>
  <div>
    <h3 class="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div
        v-for="(amenity, index) in trueAmenities"
        :key="index"
        class="flex items-center p-3 rounded-lg bg-primary/5"
      >
        <Icon :name="amenity.icon" class="mr-3 text-xl text-gray-900" />
        <div>
          <p class="capitalize font-medium text-gray-900">
            {{ amenity.name }}
          </p>
          <p
            v-if="typeof amenity.value === 'number'"
            class="text-sm text-gray-500"
          >
            {{ amenity.value }}
          </p>
        </div>
      </div>

      <!-- Show message if no amenities are available -->
      <div
        v-if="trueAmenities.length === 0"
        class="col-span-full text-center py-4 text-gray-500"
      >
        No amenities information available
      </div>
    </div>
  </div>
</template>
