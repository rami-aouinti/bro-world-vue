import { awaitSessionReady } from '~/composables/useSessionReady'

export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, fetch } = useUserSession()

  try {
    await fetch()
    await awaitSessionReady()
  } catch {
    // Session refresh failure is handled by the loggedIn check below.
  }

  if (!loggedIn.value) {
    Notify.error('You need to log in to view this page')
    return navigateTo('/')
  }
})
