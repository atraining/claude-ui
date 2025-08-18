<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center"
          >
            <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Sign in to continue to Claude UI
        </p>
        <div class="flex justify-center mt-4">
          <DarkModeToggle />
        </div>
      </div>

      <!-- Login Form -->
      <UCard class="shadow-xl border-0">
        <AuthForm
          :on-submit="handleSubmit"
          link-text="Don't have an account?"
          link-path="/signup"
          button-text="Sign In"
          class="space-y-6"
        >
          <UFormGroup label="Email Address" label-for="email">
            <UInput
              v-model="email"
              name="email"
              placeholder="Enter your email"
              autocomplete="email"
              type="email"
              size="lg"
              icon="i-heroicons-envelope"
              required
            />
          </UFormGroup>

          <UFormGroup label="Password" label-for="password">
            <UInput
              v-model="password"
              name="password"
              placeholder="Enter your password"
              minlength="6"
              autocomplete="current-password"
              type="password"
              size="lg"
              icon="i-heroicons-lock-closed"
              required
            />
          </UFormGroup>
        </AuthForm>
      </UCard>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Powered by Claude's latest AI models
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

definePageMeta({
  middleware: ["guest"],
});

const email = ref("");
const password = ref("");
const toast = useToast();

const handleSubmit = async () => {
  try {
    const res = await $fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    toast.add({
      title: "Welcome back!",
      description: "Successfully signed in",
      color: "green",
      icon: "i-heroicons-check-circle",
    });

    await navigateTo("/");
  } catch (error) {
    console.error("Login failed", error);
    toast.add({
      title: "Sign in failed",
      description:
        error.data?.message || error.message || "Invalid email or password",
      color: "red",
      icon: "i-heroicons-exclamation-triangle",
    });
  }
};
</script>
