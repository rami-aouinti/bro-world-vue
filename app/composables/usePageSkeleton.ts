export function usePageSkeleton(duration = 650) {
  const isPageSkeletonVisible = ref(true)
  let timer: ReturnType<typeof setTimeout> | null = null

  const startSkeleton = () => {
    isPageSkeletonVisible.value = true

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      isPageSkeletonVisible.value = false
      timer = null
    }, duration)
  }

  onMounted(startSkeleton)

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
