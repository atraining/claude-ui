import { onMounted, onUpdated, ref, watch } from "vue";

export function useAutoScroll(messagesRef) {
  const containerRef = ref<HTMLElement | null>(null);

  const scrollToBottom = () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  };

  watch(messagesRef, scrollToBottom, { immediate: true });

  return { containerRef };
}
