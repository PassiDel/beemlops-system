<script setup lang="ts">
const route = useRoute();

const { loggedIn, user, session, clear } = useUserSession();

const { data, pending } = useFetch('/api/health', {
  lazy: true,
  server: false
});
</script>

<template>
  <div>
    <h1>{{ $t('home.title') }}</h1>
    <p>{{ $t('home.route', { path: route.path }) }}</p>
    <p v-if="!pending">{{ data?.ok ? 'Ok!' : 'Not ok!' }}</p>
    <div v-if="loggedIn">
      <h1>Welcome {{ user.name }}!</h1>
      <p>Logged in since {{ session.loggedInAt }}</p>
      <button @click="clear">Logout</button>
    </div>
    <div v-else>
      <h1>Not logged in</h1>
    </div>
  </div>
</template>
