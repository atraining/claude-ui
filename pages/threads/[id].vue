<template>
    <div class="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar></Sidebar>
        <div class="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
            <!-- Messages Area with native scrolling -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto overflow-x-hidden p-4">
                <div v-for="message in messages" :key="message.id" :class="[
                    'flex mb-4 max-w-full',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                ]">
                    <div :class="[
                        'flex items-start max-w-[85%]',
                        message.role === 'user' ? 'flex-row-reverse' : ''
                    ]">
                        <UAvatar :src="message.role === 'user' ? '/user-avatar.png' : '/assistant-avatar.png'"
                            :alt="message.role === 'user' ? 'User' : 'AI'" size="sm" class="flex-shrink-0">
                        </UAvatar>
                        <div :class="[
                            'mx-2 px-4 py-2 rounded-lg break-words',
                            message.role === 'user'
                                ? 'bg-primary text-white dark:bg-primary-600'
                                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100'
                        ]" v-html="$mdRenderer.render(message.content)">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Area with File Attachments -->
            <div class="shrink-0 pb-4 px-4">
                <!-- File Attachments Display -->
                <div v-if="attachedFiles.length" class="mb-2 flex flex-wrap">
                    <div v-for="file in attachedFiles" :key="file.name"
                        class=" p-2 mr-2 flex items-center gap-2 mb-1 bg-gray-50 dark:bg-gray-800 rounded">
                        <UCheckbox v-model="file.selected" />
                        <UBadge size="sm" variant="ghost">{{ file.name }}</UBadge>
                        <UBadge size="sm" variant="solid">{{ file.tokens }} tokens</UBadge>
                        <UButton size="xs" color="red" variant="ghost" icon="i-heroicons-x-mark"
                            @click="removeFile(file)" />
                    </div>
                </div>

                <form @submit.prevent="handleSendMessage" class="flex flex-col gap-2">
                    <div class="flex gap-2">
                        <UTextarea v-model="inputMessage" placeholder="Type your message here..."
                            class="flex-grow min-w-0 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                            :rows="3" :auto-size="true" :max-rows="4">
                        </UTextarea>
                        <div class="flex flex-col gap-2">
                            <UButton type="button" color="gray" icon="i-heroicons-paper-clip" class="flex-shrink-0"
                                @click="triggerFileInput">
                            </UButton>
                            <UButton type="submit" color="primary" icon="i-heroicons-paper-airplane-20-solid"
                                class="flex-shrink-0">
                                Send
                            </UButton>
                        </div>
                    </div>
                </form>

                <!-- Hidden file input -->
                <input type="file" ref="fileInput" @change="handleFileSelect" multiple class="hidden">
            </div>
        </div>
        <CreateThreadModal></CreateThreadModal>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '~/components/Sidebar.vue';
const { $mdRenderer } = useNuxtApp()
const { getThread } = useApp()

const route = useRoute()
const messages = ref([])
const inputMessage = ref('')
const messagesContainer = ref(null)



const fileInput = ref(null)
const attachedFiles = ref([])

const triggerFileInput = () => {
    fileInput.value.click()
}

// get array of ids of selected files
const selectedFiles = computed(() => {
    return attachedFiles.value.filter(file => file.selected).map(file => file.id)
})

const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    files.forEach(async (file) => {

        let formData = new FormData()
        formData.append('file', file)
        const fileReq = await $fetch(`/api/threads/${route.params.id}/files`, {
            method: 'post',
            body: formData
        })

        attachedFiles.value.push({
            file,
            name: file.name,
            selected: true,
            tokens: fileReq.file.tokens,
            id: fileReq.last_row_id
        })
    })
    fileInput.value.value = '' // Reset file input
}

const removeFile = async (fileToRemove) => {
    await $fetch(`/api/files/${fileToRemove.id}`, {
        method: 'DELETE',
    })
    attachedFiles.value = attachedFiles.value.filter(file => file !== fileToRemove)
}

watch(messages, () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}, { deep: true })

onMounted(async () => {
    try {
        messages.value = await $fetch('/api/messages/' + route.params.id)
        const thread = await getThread(route.params.id)
        attachedFiles.value = thread?.files ?? [] // Using nullish coalescing
    } catch (error) {
        console.error('Error loading thread:', error)
        attachedFiles.value = [] // Ensure attachedFiles is always initialized
    }
})

const handleSendMessage = async () => {
    if (inputMessage.value.trim() !== '') {
        const newMessage = {
            id: messages.value.length + 1,
            content: inputMessage.value,
            role: 'user'
        }
        messages.value.push(newMessage)
        inputMessage.value = ''

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