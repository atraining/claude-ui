<template>
    <div class="shrink-0 pb-4 px-4">
        <FileAttachments :files="attachedFiles" @remove-file="removeFile" />
        
        <form @submit.prevent="handleSendMessage" class="flex flex-col gap-2">
            <div class="flex gap-2">
                <UTextarea 
                    v-model="inputMessage" 
                    placeholder="Type your message here..."
                    class="flex-grow min-w-0 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                    :rows="3" 
                    :auto-size="true" 
                    :max-rows="4">
                </UTextarea>
                
                <div class="flex flex-col gap-2">
                    <UButton 
                        :loading="loader" 
                        type="button" 
                        color="gray" 
                        icon="i-heroicons-paper-clip"
                        class="flex-shrink-0" 
                        @click="triggerFileInput">
                    </UButton>
                    <UButton 
                        :loading="loader" 
                        type="submit" 
                        color="primary"
                        icon="i-heroicons-paper-airplane-20-solid" 
                        class="flex-shrink-0">
                        Send
                    </UButton>
                </div>
            </div>
        </form>

        <!-- Hidden file input -->
        <input 
            type="file" 
            ref="fileInput"
            accept=".html,.ts,.htm,.atom,.rss,.md,.markdown,.epub,.xml,.xsl,.pdf,.doc,.docx,.odt,.ott,.rtf,.xls,.xlsx,.xlsb,.xlsm,.xltx,.csv,.ods,.ots,.pptx,.potx,.odp,.otp,.odg,.otg,.png,.jpg,.jpeg,.gif,.dxf,.js,text/*"
            @change="handleFileSelect" 
            multiple 
            class="hidden">
    </div>
</template>

<script setup>
import { ref } from 'vue'
const route = useRoute()
const { loader } = useLoader()
const {  messages } = useApp()

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
            let formData = new FormData()
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
    if (inputMessage.value.trim() !== '') {
        const newMessage = {
            id: messages.value.length + 1,
            content: inputMessage.value,
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