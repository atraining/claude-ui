<template>
    <div class="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar/>
        <div class="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
            <!-- Messages List Component -->
            <MessageList :messages="messages" />

            <!-- Message Input Component -->
            <MessageInput 
                v-model:attached-files="attachedFiles"
                @send-message="handleSendMessage"
            />
        </div>
        <CreateThreadModal />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const { getThread , messages } = useApp()
const { loader } = useLoader()

const attachedFiles = ref([])


definePageMeta({
  middleware: ["auth"]
})

// get array of ids of selected files
const selectedFiles = computed(() => {
    return attachedFiles.value
        .filter(file => file.selected)
        .map(file => file.id)
})

// Load initial data
onMounted(async () => {
    try {
        loader.value = true
        messages.value = await $fetch('/api/messages/' + route.params.id)
        const thread = await getThread(route.params.id)
        attachedFiles.value = thread?.files ?? []
    } catch (error) {
        console.error('Error loading thread:', error)
        attachedFiles.value = []
    } finally {
        loader.value = false
    }
})

const handleSendMessage = async (messageText) => {
    if (messageText.trim() !== '') {
        const newMessage = {
            id: messages.value.length + 1,
            content: messageText,
            role: 'user'
        }
        messages.value.push(newMessage)
        loader.value = true

        try {
            const res = await $fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: messages.value,
                    threadId: route.params.id,
                    selectedFiles: selectedFiles.value
                })
            })

            messages.value.push({
                id: messages.value.length + 1,
                content: res.content[0].text,
                role: 'assistant'
            })
        } catch (error) {
            console.error('Error sending message:', error)
            // Handle error (maybe show a notification to user)
        } finally {
            loader.value = false
        }
    }
}
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