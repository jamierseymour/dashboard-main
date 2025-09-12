// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui-pro",
    "@vueuse/nuxt",
    "@nuxtjs/supabase",
    "@nuxt/image",
    "@pinia/nuxt",
  ],
  ssr: false,
  devtools: {
    enabled: true,
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("gmp-"),
    },
  },

  app: {
    head: {
      script: [
        {
          src: `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async&v=weekly`,
          async: true,
          defer: true,
        },
      ],
    },
  },
  css: ["~/assets/css/main.css"],

  routeRules: {
    "/api/**": {
      cors: true,
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-07-11",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  supabase: {
    redirect: false,
    // Options
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: [],
      cookieRedirect: false,
    },
  },
});
