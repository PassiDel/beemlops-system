<script setup lang="ts">
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});
</script>

<template>
  <NuxtLink
    v-for="l in availableLocales"
    :key="l.code"
    :to="switchLocalePath(l.code)"
    >{{ $t(l.code) }}</NuxtLink
  >
</template>
