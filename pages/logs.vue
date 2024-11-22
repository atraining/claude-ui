<template>
  <div
    class="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200"
  >
    <Sidebar />

    <div class="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
      <UTable :columns="cols" :rows="logsData?.items || []">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="italic text-sm">No logs here!</span>
          </div>
        </template>
      </UTable>
      <UPagination
        v-model="currentPage"
        :total="logsData?.pagination?.totalCount || 0"
        :to="
          (page) => ({
            query: { page },
          })
        "
      />
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const currentPage = ref(parseInt(route.query.page) || 1);

// Create a reactive fetch key that changes with the page
const fetchKey = computed(() => `/api/logs?page=${currentPage.value}`);

// Use a reactive fetch that will automatically refetch when the key changes
const { data: logsData, refresh } = await useFetch(fetchKey, {
  watch: [fetchKey],
});

// Watch for route changes
watch(
  () => route.query.page,
  async (newPage) => {
    currentPage.value = parseInt(newPage) || 1;
    await refresh();
  },
);

const cols = [
  {
    key: "inputTokens",
    label: "Input Tokens",
    width: "100px",
    align: "center",
    sortable: true,
  },
  {
    key: "outputTokens",
    label: "Output Tokens",
    width: "100px",
    align: "center",
    sortable: true,
  },
  {
    key: "cacheReadInputTokens",
    label: "Cache Creation Input Tokens",
    width: "100px",
    align: "center",
    sortable: true,
  },
  {
    key: "cacheCreationInputTokens",
    label: "Cache Read Input Tokens",
    width: "100px",
    align: "center",
    sortable: true,
  },
  {
    key: "createdAt",
    label: "Created At",
    width: "100px",
    align: "center",
    sortable: true,
  },
];
</script>
