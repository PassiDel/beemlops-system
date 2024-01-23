<script setup lang="ts">
import type { Ref } from 'vue';
import type { HiveDto } from '~/server/dto/hive';

definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.location.hive.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations/[locationid]/[hiveid]',
    de: '/teams/[teamid]/orte/[locationid]/[hiveid]'
  }
});
const localePath = useLocalePath();
const { teamid, locationid, hiveid } = useRoute().params;

const {
  data: _hive,
  error,
  pending,
  refresh
} = await useFetch(`/api/hives/${hiveid}`, {
  lazy: true
});
if (error && error.value) {
  throw createError(error.value);
}
const hive = _hive as unknown as Ref<
  HiveDto & { isCreator: boolean } & {
    sensors: {
      id: number;
      name: string;
      unit: string;
      devices: { key: string | null; id: number; deviceId: number }[];
    }[];
  }
>;

const window = ref({ start: new Date(), end: new Date() });
const {
  data,
  pending: pendingData,
  execute
} = await useFetch(`/api/hives/${hiveid}/data`, {
  lazy: true,
  immediate: false,
  server: false,
  query: window
});

function newTimeWindow(range: { start: Date; end: Date }) {
  window.value = range;
  execute();
}
</script>

<template>
  <div v-if="!pending && hive">
    <div class="flex flex-wrap gap-8 mb-8 w-full">
      <h1 class="text-3xl overflow-hidden overflow-ellipsis">
        {{ hive.name }}
      </h1>
      <VaButton color="primary" :disabled="pending" @click="refresh"
        ><VaIcon name="refresh"
      /></VaButton>
      <VaButton
        v-if="hive.isCreator"
        :disabled="pending"
        color="warning"
        :to="localePath(`/teams/${teamid}/locations/${locationid}/${hiveid}/edit`)"
        ><VaIcon name="edit"
      /></VaButton>
      <VaSpacer />
      <TimeWindow :pending="pendingData" @update="newTimeWindow" />
    </div>

    <div class="grid grid-cols-12 gap-6">
      <VaInnerLoading
        v-for="sensor in hive.sensors"
        :key="`s-${sensor.id}`"
        :loading="pendingData"
        class="col-span-12 md:col-span-6 xl:col-span-4"
      >
        <VaCard stripe stripe-color="success">
          <VaCardTitle
            >{{
              $te(`units.${sensor.name}`)
                ? $t(`units.${sensor.name}`)
                : sensor.name
            }}
            - {{ sensor.unit }}</VaCardTitle
          >
          <VaCardContent>
            <HiveGraph :sensor="sensor" :data="data" />
          </VaCardContent>
        </VaCard>
      </VaInnerLoading>
    </div>
  </div>
</template>

<style scoped></style>
