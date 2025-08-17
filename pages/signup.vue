<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-user-plus" class="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create your account
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Join Claude UI and start chatting with AI
        </p>
        <div class="flex justify-center mt-4">
          <DarkModeToggle />
        </div>
      </div>

      <!-- Signup Form -->
      <UCard class="shadow-xl border-0">
        <AuthForm
          :on-submit="handleSubmit"
          button-text="Create Account"
          link-text="Already have an account?"
          link-path="/login"
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
          
          <UFormGroup 
            label="Password" 
            label-for="password"
            help="Must be at least 6 characters long"
          >
            <UInput
              v-model="password"
              name="password"
              placeholder="Create a password"
              minlength="6"
              autocomplete="new-password"
              type="password"
              size="lg"
              icon="i-heroicons-lock-closed"
              required
            />
          </UFormGroup>
        </AuthForm>
      </UCard>

      <!-- Terms and Privacy -->
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

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
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    
    if (res.ok) {
      toast.add({
        title: "Account created!",
        description: "Please sign in with your new account",
        color: "green",
        icon: "i-heroicons-check-circle",
      });
      await navigateTo("/login");
    } else {
      const data = await res.json();
      toast.add({
        title: "Sign up failed",
        description: data.message || "Could not create account",
        color: "red",
        icon: "i-heroicons-exclamation-triangle",
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    toast.add({
      title: "Sign up failed",
      description: "Something went wrong. Please try again.",
      color: "red",
      icon: "i-heroicons-exclamation-triangle",
    });
  }
};
</script>
