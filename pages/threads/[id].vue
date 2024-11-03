<template>
    <div class="flex h-screen bg-gray-100">
        <Sidebar></Sidebar>
        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
            <!-- Messages Area with native scrolling -->
            <div class="flex-1 overflow-y-auto overflow-x-hidden p-4">
                <div v-for="message in messages" 
                     :key="message.id" 
                     :class="[
                    'flex mb-4 max-w-full',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                ]">
                    <div :class="[
                        'flex items-start max-w-[85%]',
                        message.role === 'user' ? 'flex-row-reverse' : ''
                    ]">
                        <UAvatar 
                            :src="message.role === 'user' ? '/user-avatar.png' : '/assistant-avatar.png'"
                            :alt="message.role === 'user' ? 'User' : 'AI'" 
                            size="sm" 
                            class="flex-shrink-0">
                        </UAvatar>
                        <div :class="[
                            'mx-2 px-4 py-2 rounded-lg break-words',
                            message.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200'
                        ]" 
                        v-html="$mdRenderer.render(message.content)">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Area - Fixed at bottom -->
            <div class="shrink-0 p-4">
                <form @submit.prevent="handleSendMessage" class="flex space-x-2">
                    <UTextarea 
                        v-model="inputMessage" 
                        placeholder="Type your message here..." 
                        class="flex-grow min-w-0"
                        :rows="2"
                        :auto-size="true"
                        :max-rows="4">
                    </UTextarea>
                    <UButton 
                        type="submit" 
                        color="primary" 
                        :icon="sendIcon"
                        class="flex-shrink-0">
                        Send
                    </UButton>
                </form>
            </div>
        </div>

        <CreateThreadModal></CreateThreadModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '~/components/Sidebar.vue';
const { $mdRenderer } = useNuxtApp()

const route = useRoute()
const messages = ref([])
const inputMessage = ref('')

onMounted(async () => {
    messages.value = await $fetch('/api/messages/' + route.params.id)
})

const userMessages = computed(() =>
    messages.value.filter(m => m.role === 'user')
)

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
                threadId: route.params.id
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