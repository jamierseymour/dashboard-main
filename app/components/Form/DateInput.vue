<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

withDefaults(defineProps<{
  placeholder?: string
}>(), {
  placeholder: 'Pick a date',
})

const modelValue = defineModel<string>({ default: '' })

const isOpen = ref(false)
const df = new DateFormatter('en-ZA', { dateStyle: 'medium' })

const calendarDate = computed<CalendarDate | undefined>({
  get: () => {
    if (!modelValue.value) return undefined
    const parts = modelValue.value.split('-').map(Number)
    if (parts.length !== 3 || parts.some(isNaN)) return undefined
    return new CalendarDate(parts[0]!, parts[1]!, parts[2]!)
  },
  set: (val) => {
    modelValue.value = val
      ? `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`
      : ''
  },
})

const displayValue = computed(() =>
  calendarDate.value
    ? df.format(calendarDate.value.toDate(getLocalTimeZone()))
    : null,
)

function handleSelect(val: CalendarDate | undefined) {
  calendarDate.value = val
  isOpen.value = false
}
</script>

<template>
  <UPopover v-model:open="isOpen" :content="{ align: 'start' }">
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-calendar"
      class="w-full justify-start font-normal"
      :class="!displayValue ? 'text-(--ui-text-muted)' : ''"
    >
      {{ displayValue || placeholder }}
    </UButton>

    <template #content>
      <UCalendar
        :model-value="calendarDate"
        class="p-2"
        @update:model-value="handleSelect"
      />
    </template>
  </UPopover>
</template>
