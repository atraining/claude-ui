// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxt/ui" , "@nuxt/eslint"],
  runtimeConfig: {
    anthropicKey: process.env.ANTHROPIC_KEY,
    databaseUrl: process.env.DATABASE_URL || "./database.db",
  },
});
