<template>
    <UModal v-model="isModalOpen">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #title>
                New Chat
            </template>
            <template #default>
                <div class="flex flex-col space-y-4">
                    <UFormGroup label="Name" label-for="name">
                        <UInput id="name" v-model="name" placeholder="Enter a name for the chat" />
                    </UFormGroup>
                    <UFormGroup label="System Message" label-for="systemMessage">
                        <UTextarea id="systemMessage" v-model="systemMessage"
                            placeholder="Enter a system message for the chat" />
                    </UFormGroup>
                    <UButton block type="submit" color="primary" @click="handleCreateThread">
                        Create Thread
                    </UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>
<script setup>
const { isModalOpen, closeModal } = useCustomModal()

const name = ref('')
const systemMessage = ref('')

const handleCreateThread = async () => {
    const res = await $fetch('/api/threads', {
        method: 'POST',
        body: JSON.stringify({
            name: name.value,
            systemMessage: systemMessage.value
        })
    })

    navigateTo('/threads/' + res.last_row_id)

    closeModal()

}

</script>