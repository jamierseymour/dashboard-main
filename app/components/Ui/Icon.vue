<script setup lang="ts">
import { SVGAttributes } from "nuxt/dist/app/compat/capi";

interface IconProps {
  class?: any;
  path: string;
  viewBox?: string;
  pathStrokeLinecap?: SVGAttributes["stroke-linecap"];
  pathFill?: string;
  pathClass?: string;
  pathStrokeWidth?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
  class: "",
  viewBox: "0 0 24 24",
  pathStrokeLinecap: "square",
});
</script>

<template>
  <svg
    :class="props.class || 'w-5 h-5 fill-[currentColor]'"
    :viewBox="props.viewBox || '0 0 24 24'"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      :class="pathClass"
      :d="props.path"
      :stroke-linecap="pathStrokeLinecap"
      :fill="pathFill"
      :stroke-width="pathStrokeWidth"
    />
  </svg>
</template>
