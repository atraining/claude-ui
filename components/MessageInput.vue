<template>
    <div class="shrink-0 pb-4 px-4">
        <FileAttachments :files="attachedFiles" @remove-file="removeFile" />

        <form class="flex flex-col gap-2" @submit.prevent="handleSendMessage">
            <div class="flex gap-2">
                <UTextarea v-model="inputMessage" placeholder="Type your message here..."
                    class="flex-grow min-w-0 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                    :rows="3" :auto-size="true" :max-rows="4" />

                <div class="flex flex-col gap-2">
                    <UButton :loading="loader" type="button" color="gray" icon="i-heroicons-paper-clip"
                        class="flex-shrink-0" @click="triggerFileInput" />
                    <UButton :loading="loader" type="submit" color="primary" icon="i-heroicons-paper-airplane-20-solid"
                        class="flex-shrink-0">
                        Send
                    </UButton>
                </div>
            </div>
        </form>

        <!-- Hidden file input -->
        <input ref="fileInput" type="file"
            accept=".html,.ts,.htm,.atom,.rss,.md,.markdown,.epub,.xml,.xsl,.pdf,.doc,.docx,.odt,.ott,.rtf,.xls,.xlsx,.xlsb,.xlsm,.xltx,.csv,.ods,.ots,.pptx,.potx,.odp,.otp,.odg,.otg,.png,.jpg,.jpeg,.gif,.dxf,.js,text/*"
            multiple class="hidden" @change="handleFileSelect">
    </div>
</template>

<script setup>
import { ref } from 'vue'
const route = useRoute()
const { loader } = useLoader()
const { messages } = useApp()
const toast = useToast()

const props = defineProps({
    attachedFiles: {
        type: Array,
        default: () => [],
        required: true
    }
})

const emit = defineEmits(['update:attachedFiles', 'send-message'])

const inputMessage = ref('')
const fileInput = ref(null)

const triggerFileInput = () => {
    fileInput.value.click()
}

const selectedFiles = computed(() => {
    return (props.attachedFiles || [])
        .filter(file => file.selected)
        .map(file => file.id)
})


const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    loader.value = true

    try {
        for (const file of files) {
            const formData = new FormData()
            formData.append('file', file)
            const fileReq = await $fetch(`/api/threads/${route.params.id}/files`, {
                method: 'post',
                body: formData
            })

            const newFile = {
                file,
                name: file.name,
                selected: true,
                tokens: fileReq.file.tokens,
                id: fileReq.last_row_id
            }

            emit('update:attachedFiles', [...props.attachedFiles, newFile])
        }
    } catch (error) {
        console.error('Error uploading files:', error)
    } finally {
        fileInput.value.value = '' // Reset file input
        loader.value = false
    }
}

const removeFile = async (fileToRemove) => {
    loader.value = true
    try {
        await $fetch(`/api/files/${fileToRemove.id}`, {
            method: 'DELETE',
        })
        emit('update:attachedFiles', props.attachedFiles.filter(file => file !== fileToRemove))
    } catch (error) {
        console.error('Error removing file:', error)
    } finally {
        loader.value = false
    }
}

const handleSendMessage = async () => {
    if (inputMessage.value.trim() === '') return

    // Add user message
    const userMessage = {
        id: messages.value.length + 1,
        createdAt: new Date(),
        content: inputMessage.value,
        role: 'user'
    }
    messages.value.push(userMessage)

    // Create assistant message placeholder for streaming
    const assistantMessage = {
        id: messages.value.length + 2,
        createdAt: new Date(),
        content: '',  // Will be updated as we receive chunks
        role: 'assistant'
    }
    messages.value.push(assistantMessage)

    loader.value = true
    const messageContent = inputMessage.value
    inputMessage.value = '' // Clear input after sending

    try {
        // Use regular fetch for streaming
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: messageContent,
                threadId: route.params.id,
                selectedFiles: selectedFiles.value
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        try {
            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.trim() && line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(5))
                            if (data.type === 'content_block_delta' && data.delta?.text) {
                                // Update the last messages item with the new content
                                messages.value[messages.value.length - 1].content += data.delta.text
                                // delay to allow the UI to update
                                await new Promise(resolve => setTimeout(resolve, 100))
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e)
                            toast.add({
                                title: 'Error',
                                description: 'Error parsing response data',
                                color: 'red',
                                timeout: 5000,
                                icon: 'i-heroicons-exclamation-circle'
                            })
                        }
                    }
                }
            }
        } catch (streamError) {
            console.error('Error reading stream:', streamError)
            toast.add({
                title: 'Error',
                description: 'Error reading response stream',
                color: 'red',
                timeout: 5000,
                icon: 'i-heroicons-exclamation-circle'
            })
            // remove assistant message on error
            messages.value.pop()
        }
    } catch (error) {
        console.error('Error sending message:', error)
        toast.add({
            title: 'Error',
            description: error.message || 'Failed to send message',
            color: 'red',
            timeout: 5000,
            icon: 'i-heroicons-exclamation-circle'
        })
        // remove assistant message on error
        messages.value.pop()
    } finally {
        loader.value = false
    }
}
</script>