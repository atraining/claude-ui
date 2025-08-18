<template>
  <div
    class="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
  >
    <Sidebar />

    <div class="flex-1 flex items-center justify-center p-8">
      <div class="max-w-2xl mx-auto text-center">
        <!-- Welcome Section -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Claude UI
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Create intelligent AI agents powered by Claude's latest models
          </p>
        </div>

        <!-- Quick Start Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <UCard
            class="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
            @click="openModal"
          >
            <div class="flex flex-col items-center text-center">
              <div
                class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4"
              >
                <UIcon
                  name="i-heroicons-plus-circle"
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                />
              </div>
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
              >
                Create New Agent
              </h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                Set up a specialized AI assistant with custom instructions
              </p>
            </div>
          </UCard>

          <UCard class="p-6 hover:shadow-lg transition-shadow">
            <div class="flex flex-col items-center text-center">
              <div
                class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-6 h-6 text-green-600 dark:text-green-400"
                />
              </div>
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
              >
                Import Documents
              </h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                Upload files to give your AI context and knowledge
              </p>
            </div>
          </UCard>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="text-center">
            <div
              class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <UIcon
                name="i-heroicons-cpu-chip"
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
              />
            </div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-1">
              Latest Claude Models
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Claude 3.5 Sonnet, Haiku, and Opus
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <UIcon
                name="i-heroicons-document-arrow-up"
                class="w-5 h-5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-1">
              File Processing
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Upload PDFs, docs, and code files
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <UIcon
                name="i-heroicons-bolt"
                class="w-5 h-5 text-amber-600 dark:text-amber-400"
              />
            </div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-1">
              Real-time Streaming
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              See responses as they're generated
            </p>
          </div>
        </div>
      </div>
    </div>

    <CreateThreadModal />
  </div>
</template>
<script setup>
const { openModal } = useCustomModal();

definePageMeta({
  middleware: ["auth"],
});
</script>
