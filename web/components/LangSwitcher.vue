<script setup lang="ts">
import { getFlagEmoji } from '../utils/flag';

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});
</script>

<template>
  <VaSidebarItem
    v-for="l in availableLocales"
    :key="l.code"
    :to="switchLocalePath(l.code)"
  >
    <VaSidebarItemContent>
      <span>{{ getFlagEmoji(l.iso.split('-')[1]) }}</span>
      <VaSidebarItemTitle>
        {{ $t(l.code) }}
      </VaSidebarItemTitle>
    </VaSidebarItemContent>
  </VaSidebarItem>
</template>
