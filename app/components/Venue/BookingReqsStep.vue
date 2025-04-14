<script setup lang="ts">
import type { VenueFormData } from "~/types/venue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
}>();

// Create computed properties for two-way binding
const form = computed({
  get: () => props.formData,
  set: (value) => emit("update:formData", value),
});

// Helper function for cancellation policy updates
const updateCancellationPolicy = (field: string, value: string | number) => {
  const numericValue =
    typeof value === "string" ? parseFloat(value) || 0 : value;
  form.value = {
    ...form.value,
    cancellationPolicy: {
      ...form.value.cancellationPolicy,
      [field]: numericValue,
    },
  };
};

// Helper function for seasonal pricing updates
const updateSeasonalPricing = (field: string, value: string | number) => {
  form.value = {
    ...form.value,
    seasonalPricing: {
      ...form.value.seasonalPricing,
      [field]:
        field === "peakMonths"
          ? typeof value === "string"
            ? value.split(",").map((v) => parseInt(v.trim()) || 0)
            : [value]
          : typeof value === "string"
          ? parseFloat(value) || 0
          : value,
    },
  };
};
</script>

<template>
  <div class="w-full flex justify-center items-center p-12">
    <div class="flex flex-col w-1/2 gap-6">
      <!-- Booking Requirements Section -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">Booking Requirements</h3>
        <div class="flex flex-row gap-3">
          <div class="flex flex-col flex-1">
            <label class="text-sm mb-1">Minimum Booking Hours</label>
            <UInput
              v-model="form.minimumHours"
              color="primary"
              variant="outline"
            />
          </div>
          <div class="flex flex-col flex-1">
            <label class="text-sm mb-1">Notice Required (days)</label>
            <UInput
              v-model="form.noticeRequired"
              color="primary"
              variant="outline"
            />
          </div>
        </div>
      </div>
      <!-- Cancellation Policy Section -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">Cancellation Policy</h3>
        <div class="flex flex-row gap-3">
          <div class="flex flex-col flex-1">
            <label class="text-sm mb-1">Partial Refund Percentage</label>
            <UInput
              :model-value="form.cancellationPolicy?.partialRefundPercentage"
              @update:model-value="
                (v) => updateCancellationPolicy('partialRefundPercentage', v)
              "
              color="primary"
              variant="outline"
            />
          </div>
          <div class="flex flex-col flex-1">
            <label class="text-sm mb-1"
              >Non-refundable (days before event)</label
            >
            <UInput
              :model-value="form.cancellationPolicy?.nonRefundableDays"
              @update:model-value="
                (v) => updateCancellationPolicy('nonRefundableDays', v)
              "
              color="primary"
              variant="outline"
            />
          </div>
        </div>
      </div>

      <!-- Seasonal Pricing Section -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">Seasonal Pricing</h3>
        <div class="flex flex-row gap-3">
          <div class="flex flex-col flex-1">
            <label class="text-sm mb-1">Peak Season Price</label>
            <UInput
              :model-value="form.seasonalPricing?.peak"
              @update:model-value="(v) => updateSeasonalPricing('peak', v)"
              color="primary"
              variant="outline"
            />
          </div>
          <div class="flex flex-col flex-1">
            <label class="text-sm mb-1">Off-Peak Season Price</label>
            <UInput
              :model-value="form.seasonalPricing?.offPeak"
              @update:model-value="(v) => updateSeasonalPricing('offPeak', v)"
              color="primary"
              variant="outline"
            />
          </div>
        </div>

        <div class="flex flex-col w-full">
          <label class="text-sm mb-1">Peak Months (comma separated)</label>
          <UInput
            :model-value="form.seasonalPricing?.peakMonths?.join(', ')"
            @update:model-value="(v) => updateSeasonalPricing('peakMonths', v)"
            color="primary"
            variant="outline"
          />
        </div>
      </div>
    </div>
  </div>
</template>
