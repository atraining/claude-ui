<template>
  <div
    class="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200"
  >
    <Sidebar />
    <CreateThreadModal />
  </div>
</template>
<script setup>
definePageMeta({
  middleware: ["auth"],
});
</script>
