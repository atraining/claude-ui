<template>
    <div class="w-64 dark:bg-gray-900 bg-white border-r border-gray-200 p-4">
        <div class="flex align-center justify-between mb-4">
            <UButton :loading="loader" icon="i-heroicons-plus-circle" class="justify-start" @click="openModal">
                New Agent
            </UButton>
            <DarkModeToggle />
            <ColorPicker />
        </div>

        <UScrollbar class="h-[calc(100vh-8rem)]">
            <div class="h-[calc(100vh-8rem)]">
                <div v-for="thread in threads" :key="thread.id" class="flex items-center gap-2 group">
                    <UButton variant="ghost" block class="flex-1"
                        :class="{ 'bg-primary-500 text-white dark:bg-gray-800 dark:text-white': isSelected(thread.id) }"
                        @click="openThread(thread.id)">
                        {{ thread.name }}
                    </UButton>

                    <div class="hidden group-hover:flex gap-1">
                        <UButton :loading="loader" size="xs" color="red" variant="ghost" icon="i-heroicons-trash"
                            @click="deleteThread(thread.id)" />
                    </div>
                </div>
            </div>

        </UScrollbar>
        <div class="flex justify-between  gap-2 mt-4">
            <UButton icon="i-heroicons-arrow-left-end-on-rectangle" size="xs" variant="ghost" @click="logout">
                Logout
            </UButton>
            <UButton icon="i-heroicons-document-magnifying-glass" size="xs" variant="ghost"
                @click="navigateTo('/logs')">
                Logs
            </UButton>
        </div>
    </div>
</template>

<script setup>
const { clear } = useUserSession();

const { isModalOpen, openModal } = useCustomModal()
const { loader } = useLoader()

const { threads } = useApp()
const route = useRoute()

const isSelected = (threadId) => {
    return route.params.id === threadId.toString()
}
onMounted(async () => {
    threads.value = await $fetch('/api/threads')
})

const logout = async () => {
    await clear()
    navigateTo('/login', { replace: true })
}

const deleteThread = async (id) => {
    // Handle deleting thread
    await $fetch('/api/threads/' + id, {
        method: 'DELETE'
    })
    threads.value = threads.value.filter(thread => thread.id !== id)
    navigateTo('/')
}
const openThread = (threadId) => {
    navigateTo('/threads/' + threadId)
}
</script>