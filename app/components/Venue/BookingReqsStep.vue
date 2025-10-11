<script setup lang="ts">
import type { VenueFormData } from "~/types/venue";

const props = defineProps<{
  formData: VenueFormData;
}>();

const emit = defineEmits<{
  "update:formData": [data: VenueFormData];
}>();

// Available months for selection
const availableMonths = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

// Create computed properties for two-way binding
const form = computed({
  get: () => props.formData,
  set: (value) => emit("update:formData", value),
});

// Helper function for cancellation policy updates
const updateCancellationPolicy = (field: string, value: string | number) => {
  const numericValue =
    typeof value === "string"
      ? value === ""
        ? ""
        : parseFloat(value) || 0
      : value;
  form.value = {
    ...form.value,
    cancellationPolicy: {
      ...form.value.cancellationPolicy,
      [field]: numericValue,
    },
  };
};

// Helper function for seasonal pricing updates
const updateSeasonalPricing = (
  field: string,
  value: string | number | number[] | boolean,
) => {
  form.value = {
    ...form.value,
    seasonalPricing: {
      ...form.value.seasonalPricing,
      enabled: form.value.seasonalPricing?.enabled || false,
      peak: form.value.seasonalPricing?.peak || "",
      offPeak: form.value.seasonalPricing?.offPeak || "",
      [field]:
        field === "peakMonths"
          ? value // Value will already be an array of numbers from USelectMenu
          : typeof value === "string" && field !== "enabled"
            ? value === ""
              ? ""
              : parseFloat(value) || 0
            : value,
    },
  };
};

// Computed property for seasonal pricing enabled state
const seasonalPricingEnabled = computed({
  get: () => form.value.seasonalPricing?.enabled || false,
  set: (value: boolean) => updateSeasonalPricing("enabled", value),
});

// Computed property for peak months to handle the multi-select
const selectedPeakMonths = computed({
  get: () => form.value.seasonalPricing?.peakMonths || [],
  set: (value: number[]) => updateSeasonalPricing("peakMonths", value),
});

// Helper function for day-based pricing updates
const updateDayBasedPricing = (
  field: string,
  value: string | number | boolean,
) => {
  form.value = {
    ...form.value,
    dayBasedPricing: {
      ...form.value.dayBasedPricing,
      enabled: form.value.dayBasedPricing?.enabled || false,
      weekdayPrice: form.value.dayBasedPricing?.weekdayPrice || "",
      weekendPrice: form.value.dayBasedPricing?.weekendPrice || "",
      [field]:
        typeof value === "string" && field !== "enabled"
          ? value === ""
            ? ""
            : parseFloat(value) || 0
          : value,
    },
  };
};

// Computed property for day-based pricing enabled state
const dayBasedPricingEnabled = computed({
  get: () => form.value.dayBasedPricing?.enabled || false,
  set: (value: boolean) => updateDayBasedPricing("enabled", value),
});

// Helper function for exclusive package updates
const updateExclusivePackage = (
  field: string,
  value: string | number | boolean,
) => {
  form.value = {
    ...form.value,
    exclusivePackage: {
      ...form.value.exclusivePackage,
      enabled: form.value.exclusivePackage?.enabled || false,
      price: form.value.exclusivePackage?.price || "",
      [field]:
        field === "description"
          ? value // Keep description as string
          : typeof value === "string" && field !== "enabled"
            ? value === ""
              ? ""
              : parseFloat(value) || 0
            : value,
    },
  };
};

// Computed property for exclusive package enabled state
const exclusivePackageEnabled = computed({
  get: () => form.value.exclusivePackage?.enabled || false,
  set: (value: boolean) => updateExclusivePackage("enabled", value),
});
</script>

<template>
  <div class="w-full flex justify-center items-center p-4 sm:p-8 lg:p-12">
    <div class="flex flex-col w-full sm:w-3/4 lg:w-1/2 gap-6">
      <!-- Pricing Section -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">Pricing</h3>
        <div class="flex flex-col w-full">
          <label class="text-sm mb-1">Base Price</label>
          <UInput
            v-model="form.price"
            color="primary"
            variant="outline"
            placeholder="e.g. 10000"
            type="number"
          >
            <template #leading>
              <span class="text-gray-500 dark:text-gray-400 text-xs">R</span>
            </template>
          </UInput>
        </div>
      </div>

      <!-- Seasonal Pricing Section -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-row items-center justify-between">
          <h3 class="text-lg font-semibold">Seasonal Pricing</h3>
          <USwitch
            v-model="seasonalPricingEnabled"
            color="primary"
            class="cursor-pointer"
          />
        </div>
        <p class="text-sm text-gray-500">
          Set different prices for peak and off-peak seasons
        </p>

        <div v-if="seasonalPricingEnabled" class="flex flex-col gap-3">
          <div class="flex flex-row gap-3">
            <div class="flex flex-col flex-1">
              <label class="text-sm mb-1">Peak Season Price</label>
              <UInput
                :model-value="form.seasonalPricing?.peak"
                @update:model-value="(v) => updateSeasonalPricing('peak', v)"
                color="primary"
                variant="outline"
                placeholder="e.g. 15000"
              >
                <template #leading>
                  <span class="text-gray-500 dark:text-gray-400 text-xs"
                    >R</span
                  >
                </template>
              </UInput>
            </div>
            <div class="flex flex-col flex-1">
              <label class="text-sm mb-1">Off-Peak Season Price</label>
              <UInput
                :model-value="form.seasonalPricing?.offPeak"
                @update:model-value="(v) => updateSeasonalPricing('offPeak', v)"
                color="primary"
                variant="outline"
                placeholder="e.g. 8000"
              >
                <template #leading>
                  <span class="text-gray-500 dark:text-gray-400 text-xs"
                    >R</span
                  >
                </template>
              </UInput>
            </div>
          </div>

          <div class="flex flex-col w-full">
            <label class="text-sm mb-1">Peak Months</label>
            <USelectMenu
              v-model="selectedPeakMonths"
              multiple
              selected-icon="i-heroicons-calendar-days"
              class="h-full w-full"
              placeholder="Select Peak Months"
              :items="availableMonths"
            />
          </div>
        </div>
      </div>

      <!-- Exclusive Package Section -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-row items-center justify-between">
          <h3 class="text-lg font-semibold">Exclusive Package</h3>
          <USwitch
            v-model="exclusivePackageEnabled"
            color="primary"
            class="cursor-pointer"
          />
        </div>
        <p class="text-sm text-gray-500">
          Offer an all-inclusive premium package option
        </p>

        <div v-if="exclusivePackageEnabled" class="flex flex-col gap-3">
          <div class="flex flex-col w-full">
            <label class="text-sm mb-1">Package Price</label>
            <UInput
              :model-value="form.exclusivePackage?.price"
              @update:model-value="(v) => updateExclusivePackage('price', v)"
              color="primary"
              variant="outline"
              placeholder="e.g. 25000"
              type="number"
            >
              <template #leading>
                <span class="text-gray-500 dark:text-gray-400 text-xs">R</span>
              </template>
            </UInput>
            <span class="text-xs text-gray-400 mt-1"
              >Price for the all-inclusive premium package</span
            >
          </div>

          <div class="flex flex-col w-full">
            <label class="text-sm mb-1">Package Description (Optional)</label>
            <UTextarea
              :model-value="form.exclusivePackage?.description"
              @update:model-value="(v) => updateExclusivePackage('description', v)"
              color="primary"
              variant="outline"
              placeholder="Describe what's included in this package..."
              :rows="3"
            />
          </div>
        </div>
      </div>

      <!-- Day-Based Pricing Section -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-row items-center justify-between">
          <h3 class="text-lg font-semibold">Day-Based Pricing</h3>
          <USwitch
            v-model="dayBasedPricingEnabled"
            color="primary"
            class="cursor-pointer"
          />
        </div>
        <p class="text-sm text-gray-500">
          Set different prices for weekdays and weekends/public holidays
        </p>

        <div v-if="dayBasedPricingEnabled" class="flex flex-col gap-3">
          <div class="flex flex-row gap-3">
            <div class="flex flex-col flex-1">
              <label class="text-sm mb-1">Weekday Price (Mon-Thu)</label>
              <UInput
                :model-value="form.dayBasedPricing?.weekdayPrice"
                @update:model-value="
                  (v) => updateDayBasedPricing('weekdayPrice', v)
                "
                color="primary"
                variant="outline"
                placeholder="e.g. 5000"
              >
                <template #leading>
                  <span class="text-gray-500 dark:text-gray-400 text-xs"
                    >R</span
                  >
                </template>
              </UInput>
            </div>
            <div class="flex flex-col flex-1">
              <label class="text-sm mb-1">Weekend Price (Fri-Sun)</label>
              <UInput
                :model-value="form.dayBasedPricing?.weekendPrice"
                @update:model-value="
                  (v) => updateDayBasedPricing('weekendPrice', v)
                "
                color="primary"
                variant="outline"
                placeholder="e.g. 7500"
              >
                <template #leading>
                  <span class="text-gray-500 dark:text-gray-400 text-xs"
                    >R</span
                  >
                </template>
              </UInput>
            </div>
          </div>

          <div class="flex flex-col w-full">
            <label class="text-sm mb-1">Public Holiday Price (Optional)</label>
            <UInput
              :model-value="form.dayBasedPricing?.publicHolidayPrice"
              @update:model-value="
                (v) => updateDayBasedPricing('publicHolidayPrice', v)
              "
              color="primary"
              variant="outline"
              placeholder="e.g. 10000"
            >
              <template #leading>
                <span class="text-gray-500 dark:text-gray-400 text-xs">R</span>
              </template>
            </UInput>
            <span class="text-xs text-gray-400 mt-1"
              >Leave empty to use weekend price for public holidays</span
            >
          </div>
        </div>

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
                placeholder="e.g. 4"
              />
            </div>
            <div class="flex flex-col flex-1">
              <label class="text-sm mb-1">Notice Required (days)</label>
              <UInput
                v-model="form.noticeRequired"
                color="primary"
                variant="outline"
                placeholder="e.g. 7"
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
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove spinner from number input */
:deep(input[type="number"]::-webkit-outer-spin-button),
:deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

:deep(input[type="number"]) {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
