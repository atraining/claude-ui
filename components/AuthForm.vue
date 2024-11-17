<template>
    <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
        <slot />
        <div class="flex items-center justify-between">
            <UCheckbox v-model="rememberMe" label="Remember me" name="remember-me" />
            <div class="text-sm">
                <UButton v-if="linkPath" variant="link" :to="linkPath">
                    {{ linkText }}
                </UButton>
            </div>
        </div>
        <div>
            <UButton type="submit" block color="primary" :loading="isLoading" size="lg">
                <template #leading>
                    <UIcon name="i-heroicons-lock-closed" />
                </template>
                {{ buttonText }}
            </UButton>
        </div>
    </form>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    onSubmit: Function,
    buttonText: String,
    linkText: String,
    linkPath: String
});

const rememberMe = ref(false);
const isLoading = ref(false);
</script>