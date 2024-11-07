<template>
    <div class="w-64 dark:bg-gray-900 bg-white border-r border-gray-200 p-4">
        <div class="flex align-center justify-between mb-4">
            <UButton icon="i-heroicons-plus-circle" class="justify-start" @click="openModal">
                New Agent
            </UButton>
            <ColorButton />
            <ColorPicker />
        </div>
        <UScrollbar class="h-[calc(100vh-8rem)]">
            <div class="space-y-2">
                <div v-for="thread in threads" :key="thread.id" class="flex items-center gap-2 group">
                    <UButton variant="soft" block class="flex-1"
                        :class="{ 'bg-primary-500 text-white dark:bg-gray-800 dark:text-white': isSelected(thread.id) }"
                        @click="openThread(thread.id)">
                        {{ thread.name }}
                    </UButton>

                    <div class="hidden group-hover:flex gap-1">
                        <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-pencil-square"
                            @click="editThread(thread.id)" />
                        <UButton size="xs" color="red" variant="ghost" icon="i-heroicons-trash"
                            @click="deleteThread(thread.id)" />
                    </div>
                </div>
            </div>
        </UScrollbar>
    </div>
</template>

<script setup>
const { isModalOpen, openModal } = useCustomModal()

const { threads } = useApp()
const route = useRoute()

const isSelected = (threadId) => {
    return route.params.id === threadId.toString()
}
onMounted(async () => {
    threads.value = await $fetch('/api/threads')
})


const editThread = (id) => {
    // Handle editing thread
}

const deleteThread = (id) => {
    // Handle deleting thread
    $fetch('/api/threads/' + id, {
        method: 'DELETE'
    })
        .then(() => {
            threads.value = threads.value.filter(thread => thread.id !== id)
        })
}
const openThread = (threadId) => {
    navigateTo('/threads/' + threadId)
}
</script>