<template>
  <div
    :class="[
      'flex mb-4 lg:mb-6 max-w-full group',
      message.role === 'user' ? 'justify-end' : 'justify-start',
    ]"
  >
    <div
      :class="[
        'flex items-start max-w-[90%] lg:max-w-[85%] gap-2 lg:gap-3',
        message.role === 'user' ? 'flex-row-reverse' : '',
      ]"
    >
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <div
          :class="[
            'w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-sm font-medium',
            message.role === 'user'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
          ]"
        >
          <UIcon
            :name="message.role === 'user' ? 'i-heroicons-user' : 'i-heroicons-cpu-chip'"
            class="w-3 h-3 lg:w-4 lg:h-4"
          />
        </div>
      </div>

      <!-- Message Content -->
      <div class="flex flex-col min-w-0 flex-1">
        <!-- Message Bubble -->
        <div
          :class="[
            'px-3 lg:px-4 py-2 lg:py-3 rounded-2xl break-words shadow-sm border transition-all duration-200',
            message.role === 'user'
              ? 'bg-primary-500 text-white border-primary-600 dark:bg-primary-600 dark:border-primary-700'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:shadow-md',
          ]"
        >
          <!-- Typing indicator for streaming messages -->
          <div v-if="isStreaming && message.role === 'assistant'" class="flex items-center gap-2 mb-2">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">Claude is thinking...</span>
          </div>

          <!-- Message content -->
          <div
            :class="[
              'prose prose-sm max-w-none',
              message.role === 'user'
                ? 'prose-invert'
                : 'dark:prose-invert prose-gray',
            ]"
            v-html="$mdRenderer.render(message.content || '')"
          />
        </div>

        <!-- Message Footer -->
        <div
          :class="[
            'flex items-center justify-between mt-1 lg:mt-2 px-1 lg:px-2',
            message.role === 'user' ? 'flex-row-reverse' : '',
          ]"
        >
          <!-- Timestamp -->
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ relativeTime }}
          </span>

          <!-- Action buttons (visible on hover) -->
          <div 
            v-if="message.role === 'assistant'" 
            class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-clipboard"
              @click="copyToClipboard"
              class="hover:bg-gray-100 dark:hover:bg-gray-700"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-path"
              @click="regenerateResponse"
              class="hover:bg-gray-100 dark:hover:bg-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const { $mdRenderer } = useNuxtApp();
const toast = useToast();

const props = defineProps({
  message: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.role && value.content !== undefined;
    },
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['regenerate']);

const relativeTime = computed(() => {
  if (!props.message.createdAt) return 'now';
  
  const now = new Date();
  const createdAt = new Date(props.message.createdAt);
  const diffInSeconds = Math.floor((now - createdAt) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // For older messages, show the actual date
  return createdAt.toLocaleDateString();
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content);
    toast.add({
      title: "Copied to clipboard",
      icon: "i-heroicons-clipboard-document-check",
      color: "green",
    });
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    toast.add({
      title: "Failed to copy",
      description: "Could not copy message to clipboard",
      icon: "i-heroicons-exclamation-triangle",
      color: "red",
    });
  }
};

const regenerateResponse = () => {
  emit('regenerate', props.message);
};
</script>
