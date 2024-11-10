<template>
    <UModal v-model="isModalOpen">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #title>
                Create a new agent
            </template>
            <template #default>
                <div class="flex flex-col space-y-4">
                    <UFormGroup label="Name" label-for="name">
                        <UInput id="name" v-model="name" placeholder="Enter a name for the chat" />
                    </UFormGroup>
                    <UFormGroup label="Instructions" label-for="systemMessage">
                        <UTextarea id="systemMessage" v-model="systemMessage"
                            placeholder="You are a helpful assistant" />
                    </UFormGroup>

                    <div class="flex gap-2 justify-between">
                        
                        <UFormGroup label="Max Tokens">
                            <UInput type="number" min="10" id="maxTokens" v-model="maxTokens"
                                placeholder="Enter max token for the responce" />
                        </UFormGroup>

                        <UFormGroup label="Model">
                            <USelect v-model="model" :options="models" />
                        </UFormGroup>

                    </div>

                    <UFormGroup label="Creativity" label-for="temperature">
                        <URange id="temperature" v-model="temperature" min="0" max="1" step="0.1" />
                    </UFormGroup>
                    <UButton block type="submit" color="primary" @click="handleCreateThread">
                        Create
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
const temperature = ref(0.5)
const maxTokens = ref(1024)
const model = ref('claude-3-5-sonnet-latest')
const models = ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest']

const handleCreateThread = async () => {
    const res = await $fetch('/api/threads', {
        method: 'POST',
        body: JSON.stringify({
            name: name.value,
            systemMessage: systemMessage.value,
            temperature: temperature.value,
            model: model.value,
            maxTokens: maxTokens.value
        })
    })

    navigateTo('/threads/' + res.id)

    closeModal()

}

</script>