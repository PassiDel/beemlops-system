<script setup lang="ts">
const route = useRoute();

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
  </div>
</template>
