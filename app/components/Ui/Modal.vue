<script setup lang="ts">
interface ModalProps {
  active: boolean;
  title?: string;
  contentPadding?: boolean;
  footerPadding?: boolean;
  transparent?: boolean;
  fixedHeight?: string;
  alwaysRendered?: boolean;
  fullHeight?: boolean;
  anchor?: "top" | "middle" | "bottom";
  size?: "small" | "medium" | "large";
  rootClass?:
    | string
    | Record<string, boolean>
    | (string | Record<string, boolean>)[];
  contentClass?:
    | string
    | Record<string, boolean>
    | (string | Record<string, boolean>)[];
  contentBackgroundClass?:
    | string
    | Record<string, boolean>
    | (string | Record<string, boolean>)[];
  disableClose?: boolean;
  headerAction?: string | false;
  containerId?: string;
  settledModal?: boolean;
  showOverflow?: boolean;
  isFullscreen?: boolean;
}
const props = withDefaults(defineProps<ModalProps>(), {
  active: false,
  title: "",
  fullHeight: false,
  alwaysRendered: false,
  contentPadding: true,
  footerPadding: true,
  anchor: "middle",
  headerAction: false,
  transparent: false,
  fixedHeight: undefined,
  size: "medium",
  rootClass: "",
  contentClass: "",
  contentBackgroundClass: "bg-white dark:bg-gray-800",
  disableClose: false,
  settledModal: false,
  showOverflow: false,
  isFullscreen: false,
});

const reload = () => window.location.reload();

const emit = defineEmits<{
  (event: "set-active", active: boolean): void;
  (event: "header-action"): void;
}>();

const closeEvent = new CustomEvent("modal-close", {
  bubbles: true,
});

const handleClose = (e?: MouseEvent) => {
  if (e) e.preventDefault();
  if (props.disableClose) return;
  document.dispatchEvent(closeEvent);
  emit("set-active", false);
};

const sizes = {
  small: "w-full md:w-[345px]",
  medium: "w-full md:w-[600px]",
  large: "w-full md:w-[1080px]",
};

const anchorClass = {
  top: "items-start",
  middle: "items-start md:items-center",
  bottom: "items-end",
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") handleClose();
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.classList.remove("overflow-hidden");
  document.removeEventListener("click", clickout);
});

const wrapper = ref();

const onAfterEnter = () => {
  if (props.active)
    setTimeout(() => document.body.classList.add("overflow-hidden"), 50);
  document.addEventListener("click", clickout);
};

const clickout = (event: MouseEvent) => {
  if (event.target === wrapper.value) {
    handleClose(event);
  }
};

const onAfterLeave = () => {
  document.body.classList.remove("overflow-hidden");
  document.removeEventListener("click", clickout);
};
</script>

<template>
  <Teleport to="body">
    <Transition
      name="fade"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
      appear
    >
      <template v-if="alwaysRendered || active">
        <div
          ref="wrapper"
          v-show="active"
          :class="[
            'fixed top-0 left-0 bottom-0 right-0 z-50 flex justify-center bg-gray-900/40 dark:bg-gray-950/60 py-4 md:py-20',
            anchorClass[anchor],
            rootClass,
          ]"
        >
          <div
            :id="containerId"
            :class="[
              sizes[props.size],
              'relative z-10 drop-shadow-2xl max-w-[95%] box-content rounded-2xl',
              fixedHeight || 'max-h-full',
              {
                'overflow-hidden overflow-y-auto overflow-x-hidden':
                  !showOverflow,
              },
              { 'overflow-visible h-full flex flex-col': showOverflow },
            ]"
          >
            <!-- Header -->
            <div
              v-if="!transparent"
              :class="[
                settledModal
                  ? 'border-b border-gray-200 dark:border-gray-800'
                  : '',
                'sticky top-0 left-0 z-20 flex items-center justify-between w-full px-6 py-4 text-lg font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-t-2xl',
              ]"
            >
              <span v-if="$slots.titleElement" class="h-full">
                <slot name="titleElement" /></span
              ><span v-else>{{ props.title }}</span>
              <slot name="icon">
                <button
                  v-if="!disableClose"
                  type="button"
                  id="modal-close-btn"
                  class="p-2 -m-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  @click="handleClose()"
                >
                  <UIcon
                    name="i-heroicons-x-mark-20-solid"
                    class="w-5 h-5 cursor-pointer"
                  />
                </button>
              </slot>
              <div
                v-if="headerAction"
                class="absolute -translate-y-1/2 right-12 top-1/2"
              >
                <UButton @click="emit('header-action')" :label="headerAction" />
              </div>
            </div>
            <NuxtErrorBoundary>
              <template #error="{ error }">
                <div class="p-4 bg-white dark:bg-gray-800">
                  <p class="mb-4 font-bold">An error occurred</p>
                  <p class="text-xs">
                    {{ error }}
                  </p>
                </div>
                <div
                  class="flex justify-between w-full p-4 rounded-b-2xl bg-gray-50 dark:bg-gray-900"
                >
                  <UButton
                    color="neutral"
                    label="Cancel"
                    class="w-[48%]"
                    @click="handleClose"
                  />
                  <UButton label="Try Again" class="w-[48%]" @click="reload" />
                </div>
              </template>
              <div class="relative z-10" :class="[{ 'min-h-0': showOverflow }]">
                <!-- Overlay -->
                <slot v-if="$slots.overlay" name="overlay" />
                <div
                  :class="[
                    'relative rounded-b-2xl',
                    { 'flex flex-col h-full': showOverflow },
                  ]"
                >
                  <!-- Content -->
                  <div
                    v-if="$slots.default"
                    :class="[
                      contentClass,
                      contentBackgroundClass,
                      'relative text-gray-900 dark:text-white overflow-hidden',
                      {
                        'p-6': contentPadding,
                        'rounded-b-2xl': !$slots.footer,
                        'overflow-y-auto': showOverflow,
                      },
                    ]"
                  >
                    <div v-if="alwaysRendered" v-show="active"><slot /></div>
                    <slot v-else-if="active" />
                  </div>
                  <!-- Footer -->
                  <div
                    v-if="$slots.footer && !transparent"
                    :class="[
                      'sticky bottom-0 left-0 z-10 flex flex-col items-center justify-center rounded-b-2xl text-gray-900 dark:text-white',
                      transparent
                        ? 'bg-transparent'
                        : 'bg-gray-50 dark:bg-gray-900',
                      settledModal
                        ? 'border-t border-gray-200 dark:border-gray-800 shadow-[0_-8px_16px_0_rgba(0,0,0,0.16)]'
                        : '',
                      footerPadding ? 'p-4' : '',
                    ]"
                  >
                    <slot name="footer" />
                  </div>
                </div>
              </div>
            </NuxtErrorBoundary>
          </div>
        </div>
      </template>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
