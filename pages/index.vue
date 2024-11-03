<template>
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <div class="w-64 bg-white border-r border-gray-200 p-4">
            <UButton icon="i-heroicons-plus-circle" variant="outline" class="w-full justify-start mb-4"
                @click="isNewThreadModalOpen = true">
                New Chat
            </UButton>
            <UScrollbar class="h-[calc(100vh-8rem)]">
                <div class="space-y-2">

                </div>
            </UScrollbar>
        </div>

        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col">
            <UScrollbar class="flex-1 p-4">
                <div v-for="message in messages" :key="message.id" :class="[
                    'flex mb-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                ]">
                    <div :class="[
                        'flex items-start',
                        message.role === 'user' ? 'flex-row-reverse' : ''
                    ]">
                        <UAvatar :src="message.role === 'user' ? '/user-avatar.png' : '/assistant-avatar.png'"
                            :alt="message.role === 'user' ? 'User' : 'AI'" size="sm" />
                        <div :class="[
                            'mx-2 px-4 py-2 rounded-lg',
                            message.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200'
                        ]" v-html="$mdRenderer.render(message.content)">

                        </div>
                    </div>
                </div>
            </UScrollbar>

            <!-- Input Area -->
            <div class="p-4 border-t border-gray-200 bg-white">
                <form @submit.prevent="handleSendMessage" class="flex space-x-2">
                    <UTextarea v-model="inputMessage" placeholder="Type your message here..." class="flex-grow" />
                    <UButton type="submit" color="primary" :icon="sendIcon">
                        Send
                    </UButton>
                </form>
            </div>
        </div>

        <CreateThreadModal :is-new-thread-modal-open="isNewThreadModalOpen" />
    </div>
</template>
<script setup>
import { ref, computed } from 'vue'
const { $mdRenderer } = useNuxtApp()

const messages = ref([])

const inputMessage = ref('')
const isNewThreadModalOpen = ref(false)


onMounted(async () => {
    messages.value = await $fetch('/api/messages')
})

const userMessages = computed(() =>
    messages.value.filter(m => m.role === 'user')
)

const handleSendMessage = async () => {
    console.log('Sending message...', $mdRenderer)
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
                messages: messages.value
            })
        })

        messages.value.push({
            id: messages.value.length + 1,
            content: res.content[0].text,
            role: 'assistant'
        })
    }
}

// Icon for send button
const sendIcon = 'i-heroicons-paper-airplane-20-solid'
</script>