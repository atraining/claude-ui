<template>
  <div class="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
    <!-- Header Section -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-6 h-6 text-primary-500" />
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Claude UI</h1>
        </div>
        <div class="flex items-center gap-1">
          <DarkModeToggle />
          <ColorPicker />
        </div>
      </div>
      
      <UButton
        :loading="loader"
        icon="i-heroicons-plus-circle"
        class="w-full justify-center"
        size="lg"
        @click="openModal"
      >
        New AI Agent
      </UButton>
    </div>

    <!-- Threads List -->
    <div class="flex-1 overflow-hidden">
      <UScrollbar class="h-full">
        <div class="p-3 space-y-2">
          <div v-if="threads.length === 0" class="text-center py-8">
            <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-500 dark:text-gray-400 text-sm">No agents yet</p>
            <p class="text-gray-400 dark:text-gray-500 text-xs">Create your first AI agent to get started</p>
          </div>
          
          <div
            v-for="thread in threads"
            :key="thread.id"
            class="group relative"
          >
            <UButton
              variant="ghost"
              :class="[
                'w-full justify-start text-left h-auto p-3 transition-all duration-200',
                isSelected(thread.id)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]"
              @click="openThread(thread.id)"
            >
              <div class="flex items-start gap-3 w-full min-w-0">
                <div class="flex-shrink-0 mt-0.5">
                  <div :class="[
                    'w-2 h-2 rounded-full',
                    getModelColor(thread.model)
                  ]"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate">{{ thread.name }}</p>
                  <p class="text-xs opacity-70 truncate mt-1">{{ getModelName(thread.model) }}</p>
                  <p class="text-xs opacity-50 mt-1">{{ formatDate(thread.createdAt) }}</p>
                </div>
              </div>
            </UButton>

            <!-- Delete button that appears on hover -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <UButton
                :loading="loader"
                size="xs"
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                @click.stop="deleteThread(thread.id)"
              />
            </div>
          </div>
        </div>
      </UScrollbar>
    </div>

    <!-- Footer Section -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-document-magnifying-glass"
          size="sm"
          variant="ghost"
          class="flex-1"
          @click="navigateTo('/logs')"
        >
          Usage Logs
        </UButton>
        <UButton
          icon="i-heroicons-arrow-left-end-on-rectangle"
          size="sm"
          variant="ghost"
          color="red"
          class="flex-1"
          @click="logout"
        >
          Logout
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const { clear } = useUserSession();

const { isModalOpen, openModal } = useCustomModal();
const { loader } = useLoader();

const { threads } = useApp();
const route = useRoute();

const isSelected = (threadId) => {
  return route.params.id === threadId.toString();
};

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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

onMounted(async () => {
  threads.value = await $fetch("/api/threads");
});

const logout = async () => {
  await clear();
  navigateTo("/login", { replace: true });
};

const deleteThread = async (id) => {
  try {
    await $fetch("/api/threads/" + id, {
      method: "DELETE",
    });
    threads.value = threads.value.filter((thread) => thread.id !== id);
    navigateTo("/");
  } catch (error) {
    console.error("Error deleting thread:", error);
  }
};

const openThread = (threadId) => {
  navigateTo("/threads/" + threadId);
};
</script>
