<template>
    <div :class="[
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
</template>

<script setup>
const { $mdRenderer } = useNuxtApp()
defineProps({
    message: {
        type: Object,
        required: true
    }
})
</script>
