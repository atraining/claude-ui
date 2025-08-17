<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <Sidebar />
    
    <div class="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
      <!-- Thread Header -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex-shrink-0">
              <div :class="[
                'w-3 h-3 rounded-full',
                getModelColor(currentThread?.model)
              ]"></div>
            </div>
            <div class="min-w-0">
              <h1 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {{ currentThread?.name || 'AI Agent' }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ getModelName(currentThread?.model) }}
                <span v-if="currentThread?.maxTokens">• Max tokens: {{ currentThread.maxTokens }}</span>
                <span v-if="currentThread?.temperature">• Creativity: {{ currentThread.temperature }}</span>
              </p>
            </div>
          </div>
          
          <!-- Thread Actions -->
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              color="gray"
              icon="i-heroicons-cog-6-tooth"
              size="sm"
              @click="showSettings = true"
            />
            <UButton
              variant="ghost"
              color="red"
              icon="i-heroicons-trash"
              size="sm"
              @click="confirmDelete = true"
            />
          </div>
        </div>
      </div>

      <!-- Messages List Component -->
      <MessageList 
        :messages="messages" 
        :is-streaming="isStreaming"
        @regenerate="handleRegenerate"
      />

      <!-- Message Input Component -->
      <MessageInput
        v-model:attached-files="attachedFiles"
        @send-message="handleSendMessage"
      />
    </div>

    <!-- Modals -->
    <CreateThreadModal />
    
    <!-- Delete Confirmation Modal -->
    <UModal v-model="confirmDelete">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Delete Agent</h3>
        </template>
        <template #default>
          <p class="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "{{ currentThread?.name }}"? This action cannot be undone.
          </p>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="confirmDelete = false">Cancel</UButton>
            <UButton color="red" @click="deleteCurrentThread">Delete</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const route = useRoute();
const { getThread, messages } = useApp();
const { loader } = useLoader();
const toast = useToast();

const attachedFiles = ref([]);
const currentThread = ref(null);
const isStreaming = ref(false);
const confirmDelete = ref(false);
const showSettings = ref(false);

definePageMeta({
  middleware: ["auth"],
});

// get array of ids of selected files
const selectedFiles = computed(() => {
  return attachedFiles.value
    .filter((file) => file.selected)
    .map((file) => file.id);
});

const getModelColor = (model) => {
  if (model?.includes('sonnet')) return 'bg-blue-500';
  if (model?.includes('haiku')) return 'bg-green-500';
  if (model?.includes('opus')) return 'bg-purple-500';
  return 'bg-gray-500';
};

const getModelName = (model) => {
  const modelMap = {
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku'
  };
  return modelMap[model] || model || 'Claude 3.5 Sonnet';
};

// Load initial data
onMounted(async () => {
  try {
    loader.value = true;
    messages.value = await $fetch("/api/messages/" + route.params.id);
    const thread = await getThread(route.params.id);
    currentThread.value = thread;
    attachedFiles.value = thread?.files ?? [];
  } catch (error) {
    console.error("Error loading thread:", error);
    attachedFiles.value = [];
    toast.add({
      title: "Error loading thread",
      description: "Could not load thread data",
      color: "red",
      icon: "i-heroicons-exclamation-triangle",
    });
  } finally {
    loader.value = false;
  }
});

const handleSendMessage = async (messageText) => {
  // This is now handled in MessageInput component
  // Just need to track streaming state
  isStreaming.value = true;
  
  // Listen for when streaming is complete
  // This could be improved with proper event handling
  const checkComplete = setInterval(() => {
    if (!loader.value) {
      isStreaming.value = false;
      clearInterval(checkComplete);
    }
  }, 100);
};

const handleRegenerate = async (message) => {
  // Find the message index
  const messageIndex = messages.value.findIndex(m => m.id === message.id);
  if (messageIndex === -1) return;

  // Find the user message before this assistant message
  const userMessage = messages.value[messageIndex - 1];
  if (!userMessage || userMessage.role !== 'user') return;

  // Remove the assistant message
  messages.value.splice(messageIndex, 1);
  
  // Resend the user message
  isStreaming.value = true;
  loader.value = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userMessage.content,
        threadId: route.params.id,
        selectedFiles: selectedFiles.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Create new assistant message
    const newAssistantMessage = {
      id: Date.now() + Math.random(),
      createdAt: new Date(),
      content: "",
      role: "assistant",
    };
    messages.value.push(newAssistantMessage);

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");
    
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.trim() && line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(5));
            if (data.type === "content_block_delta" && data.delta?.text) {
              const lastMessage = messages.value[messages.value.length - 1];
              if (lastMessage.role === 'assistant') {
                lastMessage.content += data.delta.text;
              }
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e);
          }
        }
      }
    }

    toast.add({
      title: "Response regenerated",
      color: "green",
      icon: "i-heroicons-arrow-path",
    });
  } catch (error) {
    console.error("Error regenerating response:", error);
    toast.add({
      title: "Regeneration failed",
      description: "Could not regenerate response",
      color: "red",
      icon: "i-heroicons-exclamation-triangle",
    });
    // Remove the empty assistant message
    messages.value.pop();
  } finally {
    loader.value = false;
    isStreaming.value = false;
  }
};

const deleteCurrentThread = async () => {
  try {
    await $fetch(`/api/threads/${route.params.id}`, {
      method: "DELETE",
    });
    
    confirmDelete.value = false;
    
    toast.add({
      title: "Agent deleted",
      description: "The AI agent has been removed",
      color: "green",
      icon: "i-heroicons-trash",
    });
    
    await navigateTo("/");
  } catch (error) {
    console.error("Error deleting thread:", error);
    toast.add({
      title: "Delete failed",
      description: "Could not delete the agent",
      color: "red",
      icon: "i-heroicons-exclamation-triangle",
    });
  }
};
</script>

<style scoped>
/* Optional: Add styles to handle markdown content width */
:deep(.markdown-body) {
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

:deep(pre) {
  max-width: 100%;
  overflow-x: auto;
}
</style>
