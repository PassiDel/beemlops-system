<script setup lang="ts">
definePageMeta({
  title: 'about'
});
defineI18nRoute({
  paths: {
    en: '/about',
    de: '/über-uns'
  }
});
const { locale } = useI18n();
</script>

<template>
  <div>
    <h1>{{ $t('about') }}</h1>
    <p>{{ $d(new Date()) }}</p>
    <!--suppress AllyHtmlVueInspection -->
    <p>
      {{ new Intl.DateTimeFormat(locale).format(Date.now()) }}
    </p>
  </div>
</template>

<style scoped></style>
