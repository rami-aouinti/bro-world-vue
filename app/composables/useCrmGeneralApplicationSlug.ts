type CrmGeneralApplicationItem = {
  slug?: string
  platform?: {
    key?: string
  }
}

export function useCrmGeneralApplicationSlug() {
  const { data: generalApplications } = useAsyncData(
    'world-public-general-applications-crm',
    () => $fetch<{ items?: CrmGeneralApplicationItem[] }>('/api/application/public/general'),
  )

  const crmApplicationSlug = computed(() =>
    (generalApplications.value?.items ?? []).find((item) => item.platform?.key === 'crm')?.slug?.trim()
      || 'crm-general-core',
  )

  return {
    crmApplicationSlug,
  }
}
