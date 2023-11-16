<script setup lang="ts">
const localePath = useLocalePath();
</script>
<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
    <LangSwitcher />

    <NuxtLink :to="localePath('/')">Home</NuxtLink>
    <NuxtLink :to="localePath('/about')">About</NuxtLink>
    <NuxtLink :to="localePath('/users')">Users</NuxtLink>
    <NuxtLink :to="localePath('/cache')">Cache</NuxtLink>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
