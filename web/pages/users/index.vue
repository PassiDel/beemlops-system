<script setup lang="ts">
const localePath = useLocalePath();
const { data: users, pending } = await useFetch('/api/users');
</script>

<template>
  <p v-if="pending">Loading...</p>
  <ul v-else>
    <li v-for="user in users" :key="user.id">
      <NuxtLink :to="localePath(`/users/${user.id}`)">{{ user.name }}</NuxtLink>
    </li>
  </ul>
</template>

<style scoped></style>
