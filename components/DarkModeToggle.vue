<template>
  <UButton
    :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
    color="gray"
    variant="ghost"
    aria-label="Toggle color mode"
    @click="toggleColorMode"
  />
</template>

<script setup>
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>
