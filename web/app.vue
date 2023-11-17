<script setup lang="ts">
const localePath = useLocalePath();

const { loggedIn, user } = useUserSession();
</script>
<template>
  <div>
    <h1>{{ $t('welcome') }} {{ loggedIn ? user.name : '' }}</h1>
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
/*noinspection ALL*/
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
/*noinspection ALL*/
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
