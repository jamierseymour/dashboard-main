export default defineAppConfig({
  ui: {
    colors: {
      primary: 'purple',
      neutral: 'zinc'
    },
    // Global input configuration
    input: {
      default: {
        size: 'lg', // Makes all inputs large by default
      },
      base: 'text-base' // Makes text inside inputs larger (base = 16px)
    },
    textarea: {
      default: {
        size: 'lg',
      },
      base: 'text-base'
    },
    select: {
      default: {
        size: 'lg',
      },
      base: 'text-base'
    },
    selectMenu: {
      default: {
        size: 'lg',
      },
      base: 'text-base'
    }
  }
})
