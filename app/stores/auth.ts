import { defineStore } from 'pinia'

interface IAuth {
  modal: boolean
  hydrated: boolean
}

export const useAuth = defineStore('auth', () => {
  const state = reactive<IAuth>({
    modal: false,
    hydrated: false
  })

  // Define actions as functions
  function someAction() {
    // Action logic here
  }

  return {
    ...toRefs(state),
    someAction
  }
})
