<template>
  <div
    ref="messagesContainer"
    class="flex-1 overflow-y-auto overflow-x-hidden p-4"
  >
    <ChatMessage
      v-for="message in messages"
      :key="message.id"
      :message="message"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
});

const messagesContainer = ref(null);

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    });
  },
  { deep: true },
);
</script>
