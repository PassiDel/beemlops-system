<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.location.edit.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations/[locationid]/edit',
    de: '/teams/[teamid]/orte/[locationid]/bearbeiten'
  }
});
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-4"
      stripe
      stripe-color="success"
    >
      <VaCardTitle>{{
        $t('teams.team.locations.location.edit.title')
      }}</VaCardTitle>
      <VaCardContent></VaCardContent
    ></VaCard>
  </div>
</template>

<style scoped></style>
