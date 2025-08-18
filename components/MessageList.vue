<template>
  <div
    ref="messagesContainer"
    class="flex-1 overflow-y-auto overflow-x-hidden px-2 lg:px-4 py-3 lg:py-6 bg-gray-50 dark:bg-gray-900/50"
  >
    <!-- Empty state -->
    <div
      v-if="messages.length === 0"
      class="h-full flex items-center justify-center"
    >
      <div class="text-center max-w-sm">
        <UIcon
          name="i-heroicons-chat-bubble-left-ellipsis"
          class="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4"
        />
        <h3
          class="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-2"
        >
          Start a conversation
        </h3>
        <p class="text-sm lg:text-base text-gray-500 dark:text-gray-400">
          Send a message to begin chatting with your AI agent.
        </p>
      </div>
    </div>

    <!-- Messages -->
    <div v-else class="max-w-5xl lg:max-w-6xl mx-auto">
      <ChatMessage
        v-for="(message, index) in messages"
        :key="message.id || index"
        :message="message"
        :is-streaming="isLastAssistantMessage(message, index) && isStreaming"
        @regenerate="handleRegenerate"
      />

      <!-- Scroll anchor -->
      <div ref="scrollAnchor" class="h-1" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["regenerate"]);

const messagesContainer = ref(null);
const scrollAnchor = ref(null);

const scrollToBottom = () => {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    });
  }
};

const isLastAssistantMessage = (message, index) => {
  return message.role === "assistant" && index === props.messages.length - 1;
};

const handleRegenerate = (message) => {
  emit("regenerate", message);
};

// Watch for new messages and auto-scroll
watch(
  () => [props.messages.length, props.isStreaming],
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// Watch for message content changes (streaming updates)
watch(
  () => props.messages.map((m) => m.content).join(""),
  () => {
    if (props.isStreaming) {
      scrollToBottom();
    }
  },
);
</script>
