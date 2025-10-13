<template>
  <div>
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style="width: 50px; height: 50px"
    >
      <path
        class="stroke1 fill1"
        d="M8 20.3077C8 16.994 10.6863 14.3077 14 14.3077H77C80.3137 14.3077 83 16.994 83 20.3077V85.3077H8V20.3077Z"
        fill="rgba(178,42,240,1)"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></path>
      <path
        class="stroke1"
        d="M8 29.6923H83"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></path>
      <line
        class="stroke1"
        x1="21.9082"
        y1="21"
        x2="21.9082"
        y2="7"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></line>
      <line
        class="stroke1"
        x1="69.8301"
        y1="21"
        x2="69.8301"
        y2="7"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></line>
      <rect
        class="stroke1 fill1"
        x="18"
        y="41.3077"
        width="11"
        height="11"
        rx="1"
        fill="#F8955B"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></rect>
      <rect
        class="stroke1 fill1"
        x="40"
        y="41.3077"
        width="11"
        height="11"
        rx="1"
        fill="#F8955B"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></rect>
      <rect
        class="stroke1 fill1"
        x="62"
        y="41.3077"
        width="11"
        height="11"
        rx="1"
        fill="#F8955B"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></rect>
      <rect
        class="stroke1 fill1"
        x="18"
        y="63.3077"
        width="11"
        height="11"
        rx="1"
        fill="#F8955B"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></rect>
      <rect
        class="stroke1 fill1"
        x="40"
        y="63.3077"
        width="11"
        height="11"
        rx="1"
        fill="#F8955B"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></rect>
      <rect
        class="stroke1 fill1"
        x="62"
        y="63.3077"
        width="11"
        height="11"
        rx="1"
        fill="#F8955B"
        stroke="rgba(32,26,35,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></rect>
      <circle
        class="stroke2 fill2"
        cx="76"
        cy="78.5"
        r="15"
        fill="rgba(248,149,91,1)"
        stroke="rgba(22,22,22,1)"
        stroke-width="2px"
        style="animation-duration: 15s"
      ></circle>
      <path
        class="line-calendar7 stroke2"
        d="M76 79.5V70.5"
        stroke="rgba(22,22,22,1)"
        stroke-width="2px"
        stroke-linecap="round"
        style="animation-duration: 15s"
      ></path>
      <path
        class="stroke2"
        d="M76.3674 79.7481L82 83"
        stroke="rgba(22,22,22,1)"
        stroke-width="2px"
        stroke-linecap="round"
        style="animation-duration: 15s"
      ></path>
    </svg>
  </div>
</template>

<script>
export default {
  name: "StrappCalendar7",

  data() {
    return {};
  },

  mounted() {},

  methods: {},
};
</script>

<style scoped>
.line-calendar7 {
  animation: line-calendar7 15s infinite linear;
  transform-origin: 76px 79.5px;
}
@keyframes line-calendar7 {
  100% {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .line-calendar7 {
    animation: none;
  }
}
</style>
