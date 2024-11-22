export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, fetch } = useUserSession();
  await fetch();
  if (loggedIn.value) {
    return navigateTo("/");
  }
});
