<template>
    <div v-if="files.length" class="mb-2 flex flex-wrap">
        <div
v-for="file in files" :key="file.name"
            class="p-2 mr-2 flex items-center gap-2 mb-1 bg-gray-50 dark:bg-gray-800 rounded">
            <UCheckbox v-model="file.selected" />
            <UBadge size="sm" variant="ghost">{{ file.name }}</UBadge>
            <UBadge size="sm" variant="solid">{{ file.tokens }} tokens</UBadge>
            <UButton
:loading="loader" size="xs" color="red" variant="ghost" icon="i-heroicons-x-mark"
                @click="handleRemoveFile(file)" />
        </div>
    </div>
</template>

<script setup>
const { loader } = useLoader()

const props = defineProps({
    files: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['remove-file'])

const handleRemoveFile = (file) => {
    emit('remove-file', file)
}
</script>
