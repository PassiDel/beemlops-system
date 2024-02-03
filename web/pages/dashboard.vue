<script setup lang="ts">
import TotalData from '../components/dashboard/TotalData.vue';

definePageMeta({
  middleware: 'auth',
  title: 'dashboard.title'
});

const localePath = useLocalePath();
const { data, pending } = await useFetch('/api/dashboard');

const hive = ref(data.value?.hives[0]);

const hiveUri = computed(() => {
  const fullHive = data.value?.hives.find((h) => h.id === hive.value?.id);
  if (!fullHive) {
    return null;
  }
  return localePath(
    `/teams/${fullHive.team}/locations/${fullHive.location}/${fullHive.slug}`
  );
});

const { data: teamData, pending: teamPending } = await useFetch(
  () => `/api/dashboard/${hive.value?.slug}/data`
);
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-2 h-fit"
      stripe
      stripe-color="success"
    >
      <VaCardTitle>{{ $t('dashboard.title') }}</VaCardTitle>
      <VaCardContent class="flex xl:flex-col gap-8">
        <VaSelect
          v-model="hive"
          :options="data?.hives"
          :disabled="pending || teamPending"
          :label="$t('teams.team.locations.location.hive.name')"
          track-by="id"
          :text-by="(o) => (o as any).name.substring(0, 16)"
        />
        <VaButton
          v-if="hiveUri"
          class="mt-auto"
          icon="open_in_new"
          :to="hiveUri"
          >{{ $t('open') }}</VaButton
        ></VaCardContent
      ></VaCard
    >
    <TotalData :total="teamData?.total" :pending="pending || teamPending" />
    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-4"
      stripe
      stripe-color="success"
      :loading="pending || teamPending"
    >
      <VaCardTitle>{{ $t('dashboard.title') }}</VaCardTitle>
      <VaCardContent>
        <HiveGraph
          v-if="teamData"
          :data="teamData.data"
          :sensor="teamData.sensor" /></VaCardContent
    ></VaCard>
  </div>
</template>

<style scoped></style>
