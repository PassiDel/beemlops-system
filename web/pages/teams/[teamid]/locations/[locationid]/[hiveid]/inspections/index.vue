<script setup lang="ts">
import type {
  DataTableColumn,
  DataTableSortingOrder
} from 'vuestic-ui/dist/types/components/va-data-table/types';

definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.location.hive.inspections.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations/[locationid]/[hiveid]/inspections',
    de: '/teams/[teamid]/orte/[locationid]/[hiveid]/inspektionen'
  }
});

const { teamid, locationid, hiveid } = useRoute().params;
const localePath = useLocalePath();
const { t, locale } = useI18n();

const sort = reactive({
  by: 'timestamp',
  order: 'desc' as DataTableSortingOrder,
  skip: 1
});

watch(
  () => sort.by,
  () => (sort.skip = 1)
);
watch(
  () => sort.order,
  () => (sort.skip = 1)
);

const { data, pending, refresh } = await useFetch(
  `/api/hives/${hiveid}/inspections`,
  {
    query: sort
  }
);

const labelPrefix =
  'teams.team.locations.location.hive.inspections.inspection.';
const columns = computed<DataTableColumn[]>(() => [
  {
    key: 'verifiedByUser',
    label: t(labelPrefix + 'verified'),
    sortable: true
  },
  {
    key: 'notes',
    label: t(labelPrefix + 'notes'),
    tdStyle: 'max-width: 10rem',
    tdClass: 'overflow-hidden overflow-ellipsis'
  },
  { key: 'impression', label: t(labelPrefix + 'impression'), sortable: true },
  { key: 'timestamp', label: t(labelPrefix + 'timestamp'), sortable: true },
  { key: 'actions', label: t(labelPrefix + 'actions'), width: 80 }
]);
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-8 mb-8 w-full">
      <h1 class="text-3xl">
        {{ $t('teams.team.locations.location.hive.inspections.title') }}
      </h1>
      <VaButton
        color="primary"
        icon="refresh"
        :disabled="pending"
        @click="refresh"
      />
    </div>
    <VaDataTable
      v-model:sort-by="sort.by"
      v-model:sorting-order="sort.order"
      :items="data?.data || undefined"
      :columns="columns"
      disable-client-side-sorting
      items-track-by="id"
      :loading="pending"
      striped
    >
      <template #cell(verifiedByUser)="{ rowData }">{{
        $t(labelPrefix + (rowData.verifiedByUser ? 'true' : 'false'))
      }}</template>
      <!--suppress AllyHtmlVueInspection -->
      <template #cell(timestamp)="{ rowData }">{{
        // noinspection TypeScriptValidateTypes
        new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'medium'
        }).format(new Date(rowData.timestamp))
      }}</template>
      <template #cell(actions)="{ rowData }">
        <VaButton
          icon="open_in_new"
          preset="plain"
          :to="
            localePath(
              `/teams/${teamid}/locations/${locationid}/${hiveid}/inspections/${rowData.id}`
            )
          "
        />
      </template>

      <template #cell(impression)="{ rowData }"
        ><VaRating :model-value="rowData.impression" readonly color="warning"
      /></template>
      <template #bodyAppend>
        <tr>
          <td colspan="6">
            <div class="flex justify-center mt-4">
              <VaPagination
                v-model="sort.skip"
                :page-size="data?.perPage || 5"
                :total="data?.total || 0"
                :disabled="pending"
                :aria-busy="pending"
              />
            </div>
          </td>
        </tr>
      </template>
    </VaDataTable>
  </div>
</template>

<style scoped></style>
