export function useRecruitScopedApi() {
  const runtimeConfig = useRuntimeConfig()

  const recruitApplicationSlug = computed(() => {
    const configuredSlug = String(
      runtimeConfig.public.recruitApplicationSlug || '',
    ).trim()

    return configuredSlug || 'bro-world'
  })

  const scopedRecruitPath = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `/api/recruit/applications/${encodeURIComponent(recruitApplicationSlug.value)}${normalizedPath}`
  }

  return {
    recruitApplicationSlug,
    scopedRecruitPath,
  }
}
