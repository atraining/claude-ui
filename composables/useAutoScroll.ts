import { ref, nextTick, watch, onUnmounted, readonly, type Ref } from 'vue'

export function useAutoScroll(containerRef?: Ref<HTMLElement | null>) {
  const shouldAutoScroll = ref(true)
  const isUserScrolling = ref(false)

  const scrollToBottom = () => {
    if (!containerRef?.value) return
    
    nextTick(() => {
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight
      }
    })
  }

  const handleScroll = () => {
    if (!containerRef?.value) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    
    // Update auto-scroll preference based on user behavior
    shouldAutoScroll.value = isNearBottom
    
    // Detect if user is actively scrolling
    if (!isNearBottom) {
      isUserScrolling.value = true
      setTimeout(() => {
        isUserScrolling.value = false
      }, 1000)
    }
  }

  // Attach scroll listener if container ref is provided
  if (containerRef) {
    watch(containerRef, (newContainer, oldContainer) => {
      if (oldContainer) {
        oldContainer.removeEventListener('scroll', handleScroll)
      }
      if (newContainer) {
        newContainer.addEventListener('scroll', handleScroll, { passive: true })
      }
    }, { immediate: true })

    // Cleanup on unmount
    onUnmounted(() => {
      if (containerRef.value) {
        containerRef.value.removeEventListener('scroll', handleScroll)
      }
    })
  }

  return {
    shouldAutoScroll: readonly(shouldAutoScroll),
    isUserScrolling: readonly(isUserScrolling),
    scrollToBottom,
    handleScroll
  }
}
