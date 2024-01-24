<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.location.hive.inspections.inspection.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations/[locationid]/[hiveid]/inspections/[inspectionid]',
    de: '/teams/[teamid]/orte/[locationid]/[hiveid]/inspektionen/[inspectionid]'
  }
});
const localePath = useLocalePath();
const { locale } = useI18n();
const { teamid, locationid, hiveid, inspectionid } = useRoute().params;

const { data, pending, refresh, error } = await useFetch(
  `/api/inspections/${inspectionid}`
);
if (error && error.value) {
  throw createError(error.value);
}

const updating = ref(false);

const labelPrefix =
  'teams.team.locations.location.hive.inspections.inspection.';

async function updateVerified(value: boolean) {
  updating.value = true;
  await $fetch(`/api/inspections/${inspectionid}`, {
    method: 'POST',
    body: value ? 'true' : 'false'
  });
  updating.value = false;
  refresh();
}
</script>

<template>
  <div>
    <h1 class="text-3xl mb-8">
      {{
        $t('teams.team.locations.location.hive.inspections.inspection.title')
      }}
    </h1>
    <div class="grid grid-cols-12 gap-6">
      <VaCard
        class="col-span-12 lg:col-span-6 lg:col-start-4"
        stripe
        stripe-color="success"
      >
        <VaCardTitle>{{
          $t('teams.team.locations.location.hive.inspections.inspection.title')
        }}</VaCardTitle>
        <VaCardContent>
          <div
            v-if="!pending && !updating && data"
            class="grid grid-cols-[30%_70%] gap-3"
          >
            <p>{{ $t(labelPrefix + 'id') }}</p>
            <p>{{ data.id }}</p>
            <p>{{ $t(labelPrefix + 'hive') }}</p>
            <p>
              {{ data.hive.name }}
              <VaButton
                icon="open_in_new"
                :to="
                  localePath(
                    `/teams/${teamid}/locations/${locationid}/${hiveid}`
                  )
                "
                preset="plain"
              />
            </p>
            <p>{{ $t(labelPrefix + 'verified') }}</p>
            <VaCheckbox
              :model-value="data.verifiedByUser"
              :disabled="pending || updating"
              @update:model-value="updateVerified"
            />
            <p>{{ $t(labelPrefix + 'timestamp') }}</p>
            <!--suppress AllyHtmlVueInspection -->
            <p>
              {{
                // noinspection TypeScriptValidateTypes
                new Intl.DateTimeFormat(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'medium'
                }).format(new Date(data.timestamp))
              }}
            </p>
            <p>{{ $t(labelPrefix + 'created_at') }}</p>
            <!--suppress AllyHtmlVueInspection -->
            <p>
              {{
                // noinspection TypeScriptValidateTypes
                new Intl.DateTimeFormat(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'medium'
                }).format(new Date(data.createdAt))
              }}
            </p>
            <p>{{ $t(labelPrefix + 'impression') }}</p>
            <p><VaRating :model-value="data.impression" readonly color="warning" /></p>
            <p>{{ $t(labelPrefix + 'notes') }}</p>
            <p class="text-pretty break-words">
              {{ data.notes }}
            </p>
          </div>
          <VaSkeletonGroup v-else :delay="0">
            <div class="grid grid-cols-[30%_70%] gap-3">
              <p>{{ $t(labelPrefix + 'id') }}</p>
              <VaSkeleton tag="p" variant="text" />
              <p>{{ $t(labelPrefix + 'hive') }}</p>
              <VaSkeleton tag="p" variant="text" />
              <p>{{ $t(labelPrefix + 'verified') }}</p>
              <VaCheckbox disabled />
              <p>{{ $t(labelPrefix + 'timestamp') }}</p>
              <VaSkeleton tag="p" variant="text" />
              <p>{{ $t(labelPrefix + 'created_at') }}</p>
              <VaSkeleton tag="p" variant="text" />
              <p>{{ $t(labelPrefix + 'impression') }}</p>
              <p><VaRating color="warning" disabled /></p>
              <p>{{ $t(labelPrefix + 'notes') }}</p>
              <VaSkeleton tag="p" variant="text" :lines="5" />
            </div>
          </VaSkeletonGroup> </VaCardContent
      ></VaCard>
    </div>
  </div>
</template>

<style scoped></style>
