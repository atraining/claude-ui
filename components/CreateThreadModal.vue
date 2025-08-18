<template>
  <UModal v-model="isModalOpen" :ui="{ width: 'w-full sm:max-w-2xl' }">
    <UCard :ui="{
      ring: '',
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      header: { padding: 'px-6 py-4' },
      body: { padding: 'px-6 py-4' },
    }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5 inline mr-2 text-primary-500" />
            Create New AI Agent
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
        </div>
      </template>

      <template #default>
        <UForm class="space-y-6" @submit="handleCreateThread">
          <!-- Agent Name -->
          <UFormGroup label="Agent Name" label-for="name" description="Give your AI agent a memorable name">
            <UInput id="name" v-model="name" :required="true"
              placeholder="e.g., Code Assistant, Writing Helper, Data Analyst" icon="i-heroicons-user-circle"
              size="lg" />
          </UFormGroup>

          <!-- Instructions -->
          <UFormGroup label="System Instructions" label-for="systemMessage"
            description="Define how your AI agent should behave and respond">
            <UTextarea id="systemMessage" v-model="systemMessage" :required="true"
              placeholder="You are a helpful assistant specialized in..." :rows="2" resize />
          </UFormGroup>

          <!-- Model Selection -->
          <UFormGroup label="AI Model" description="Choose the Claude model that best fits your needs">
            <USelectMenu v-model="model" :options="modelOptions" option-attribute="name" value-attribute="value"
              size="lg">
              <template #option="{ option }">
                <div class="flex items-center justify-between w-full">
                  <div>
                    <p class="font-medium">{{ option.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ option.description }}
                    </p>
                  </div>
                  <UBadge :color="option.tier === 'latest'
                      ? 'primary'
                      : option.tier === 'fast'
                        ? 'green'
                        : 'gray'
                    " size="xs">
                    {{ option.tier }}
                  </UBadge>
                </div>
              </template>
            </USelectMenu>
          </UFormGroup>

          <!-- Advanced Settings -->
          <UAccordion :items="[
            {
              label: 'Advanced Settings',
              icon: 'i-heroicons-cog-6-tooth',
              slot: 'advanced',
            },
          ]" :ui="{ wrapper: 'w-full' }">
            <template #advanced>
              <div class="space-y-4 pt-4">
                <!-- Max Tokens and Temperature Row -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UFormGroup label="Max Response Tokens" description="Limit the length of responses">
                    <UInput v-model="maxTokens" type="number" min="10" max="8192" placeholder="1024" size="lg" />
                  </UFormGroup>

                  <UFormGroup label="Creativity Level"
                    :description="`Current: ${temperature} (${getCreativityLabel(temperature)})`">
                    <URange v-model="temperature" :min="0" :max="1" :step="0.1" size="lg" />
                  </UFormGroup>
                </div>
              </div>
            </template>
          </UAccordion>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4">
            <UButton color="gray" variant="ghost" size="lg" @click="closeModal">
              Cancel
            </UButton>
            <UButton type="submit" color="primary" icon="i-heroicons-sparkles" size="lg" :loading="isCreating">
              Create Agent
            </UButton>
          </div>
        </UForm>
      </template>
    </UCard>
  </UModal>
</template>
<script setup>
const { isModalOpen, closeModal } = useCustomModal();

const name = ref("");
const systemMessage = ref(
  "You are a helpful AI assistant. Provide clear, accurate, and helpful responses while being concise and engaging.",
);
const temperature = ref(0.7);
const maxTokens = ref(2048);
const model = ref("claude-3-7-sonnet-latest");
const isCreating = ref(false);

const modelOptions = [
  {
    value: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    description: "Most capable model, excellent for complex tasks",
    tier: "latest",
  },
  {
    value: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    description: "Fast and efficient for quick responses",
    tier: "fast",
  },
  {
    value: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    description: "Most powerful for highly complex tasks",
    tier: "powerful",
  },
  {
    value: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    description: "Balanced performance and speed",
    tier: "balanced",
  },
  {
    value: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    description: "Fastest responses for simple tasks",
    tier: "fast",
  },
  // Newer/alias models (ensure your Anthropic account supports these IDs)
  {
    value: "claude-3-7-sonnet-latest",
    name: "Claude 3.7 Sonnet",
    description: "Improved reasoning and quality (latest Sonnet series)",
    tier: "latest",
  },
  {
    value: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    description: "Next-gen Sonnet for advanced tasks",
    tier: "latest",
  },
  {
    value: "claude-opus-4-1-20250805",
    name: "Claude 4.1 Opus",
    description: "Most capable Opus with cutting-edge performance",
    tier: "powerful",
  },
];

const getCreativityLabel = (temp) => {
  if (temp <= 0.3) return "Focused & Precise";
  if (temp <= 0.7) return "Balanced";
  return "Creative & Varied";
};

const handleCreateThread = async () => {
  if (isCreating.value) return;

  isCreating.value = true;

  try {
    const res = await $fetch("/api/threads", {
      method: "POST",
      body: JSON.stringify({
        name: name.value,
        systemMessage: systemMessage.value,
        temperature: temperature.value,
        model: model.value,
        maxTokens: maxTokens.value,
      }),
    });

    await navigateTo("/threads/" + res.id);
    closeModal();

    // Reset form
    name.value = "";
    systemMessage.value =
      "You are a helpful AI assistant. Provide clear, accurate, and helpful responses while being concise and engaging.";
    temperature.value = 0.7;
    maxTokens.value = 2048;
    model.value = "claude-3-7-sonnet-latest";
  } catch (error) {
    console.error("Error creating thread:", error);
    // You might want to show a toast notification here
  } finally {
    isCreating.value = false;
  }
};
</script>
