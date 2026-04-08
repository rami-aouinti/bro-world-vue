export function usePageSkeleton(duration = 100) {
  const isPageSkeletonVisible = useState('page-skeleton-loading', () => true)
  let timer: ReturnType<typeof setTimeout> | null = null

  const startSkeleton = () => {
    isPageSkeletonVisible.value = true

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      isPageSkeletonVisible.value = false
      timer = null
    }, Math.max(0, duration))
  }

  onUnmounted(() => {
    if (timer) {
      clearTimeout(timer)
    }
  })

  return {
    isPageSkeletonVisible,
    startSkeleton,
  }
}
