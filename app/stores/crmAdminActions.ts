type CrmAdminRecentActions = Partial<Record<string, string>>

export const useCrmAdminActionsStore = defineStore('crm-admin-actions', () => {
  const recentBySection = ref<CrmAdminRecentActions>({})

  function rememberAction(section: string, actionId: string) {
    recentBySection.value[section] = actionId
  }

  function getRecentAction(section: string) {
    return recentBySection.value[section] ?? null
  }

  return {
    recentBySection,
    rememberAction,
    getRecentAction,
  }
})
