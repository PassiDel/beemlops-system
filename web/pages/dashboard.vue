<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  title: 'dashboard.title'
});
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-4"
      stripe
      stripe-color="success"
    >
      <VaCardTitle>{{ $t('dashboard.title') }}</VaCardTitle>
      <VaCardContent></VaCardContent
    ></VaCard>
  </div>
</template>

<style scoped></style>
