// Dev-only middleware: fixes Nuxt 4 + Vite 7 Windows path issue
// Vite 7 requires /_nuxt/@fs/C:/... but Nuxt generates /_nuxt/C:/...
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (/^\/_nuxt\/[A-Za-z]:\//.test(path)) {
    const fixed = path.replace(/^\/_nuxt\/([A-Za-z]:)\//, '/_nuxt/@fs/$1/')
    return sendRedirect(event, fixed, 302)
  }
})
