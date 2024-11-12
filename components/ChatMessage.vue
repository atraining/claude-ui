<template>
    <div
:class="[
        'flex mb-4 max-w-full',
        message.role === 'user' ? 'justify-end' : 'justify-start'
    ]">
        <div
:class="[
            'flex items-start max-w-[85%]',
            message.role === 'user' ? 'flex-row-reverse' : ''
        ]">
            <UAvatar
:src="message.role === 'user' ? '/user-avatar.png' : '/assistant-avatar.png'"
                :alt="message.role === 'user' ? 'User' : 'AI'" size="sm" class="flex-shrink-0"/>
            <div class="flex flex-col mx-2">
                <div
:class="[
                    'px-4 py-2 rounded-lg break-words',
                    message.role === 'user'
                        ? 'bg-primary text-white dark:bg-primary-600'
                        : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100'
                ]" v-html="$mdRenderer.render(message.content)"/>
                <span
:class="[
                    'text-xs mt-1',
                    message.role === 'user' ? 'text-right' : 'text-left',
                    'text-gray-500 dark:text-gray-400'
                ]">
                    {{ relativeTime }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
const { $mdRenderer } = useNuxtApp()

const props = defineProps({
    message: {
        type: Object,
        required: true,
        validator: (value) => {
            return value.role && value.content && value.createdAt
        }
    }
})

const relativeTime = computed(() => {
    const now = new Date()
    const createdAt = new Date(props.message.createdAt)
    const diffInSeconds = Math.floor((now - createdAt) / 1000)

    if (diffInSeconds < 60) {
        return 'just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
        return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
        return `${diffInDays}d ago`
    }

    // For older messages, show the actual date
    return createdAt.toLocaleDateString()
})
</script>