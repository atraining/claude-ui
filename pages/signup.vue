<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="flex justify-between items-center">
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Create your account
                </h2>
                <DarkModeToggle />
            </div>
            <AuthForm :onSubmit="handleSubmit" buttonText="Sign up" linkText="Already have an account?"
                linkPath="/login">
                <UFormGroup label="Email" label-for="email">
                    <UInput v-model="email" name="email" label="Email address" placeholder="Enter your email"
                        autocomplete="email" type="email" size="lg" required />
                </UFormGroup>
                <UFormGroup label="password" label-for="password">
                    <UInput v-model="password" name="password" label="Password" placeholder="Enter your password"
                        autocomplete="new-password" type="password" size="lg" required />
                </UFormGroup>
            </AuthForm>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('');
const password = ref('');

const handleSubmit = async () => {
    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value, password: password.value })
        });
        if (res.ok) {
            navigateTo('/')
        }
    } catch (error) {
        console.error('Signup failed', error);
    }
};
</script>