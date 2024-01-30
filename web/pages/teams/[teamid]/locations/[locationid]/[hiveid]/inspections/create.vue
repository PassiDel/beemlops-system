<script setup lang="ts">
import { useForm } from 'vuestic-ui';
import useValidation from '~/composables/useValidation';

definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.location.hive.inspections.create.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations/[locationid]/[hiveid]/inspections/create',
    de: '/teams/[teamid]/orte/[locationid]/[hiveid]/inspektionen/erstellen'
  }
});

const router = useRouter();
const localePath = useLocalePath();
const { teamid, locationid, hiveid } = useRoute().params;

const validation = useValidation();

const { isValid, isLoading, resetValidation } = useForm('formRef');
const form = reactive({
  timestamp: new Date(),
  verifiedByUser: false,
  impression: 0,
  notes: '',
  hiveId: typeof hiveid === 'string' ? hiveid : hiveid[0]
});

async function createInspection() {
  try {
    const { id } = await $fetch('/api/inspections', {
      method: 'POST',
      body: form
    });
    resetValidation();
    await router.push(
      localePath(
        `/teams/${teamid}/locations/${locationid}/${hiveid}/inspections/${id}`
      )
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl mb-8">
      {{ $t('teams.team.locations.location.hive.inspections.create.title') }}
    </h1>
    <div class="grid grid-cols-12 gap-6">
      <VaCard
        class="col-span-12 lg:col-span-6 lg:col-start-4"
        stripe
        stripe-color="success"
      >
        <VaCardTitle>{{
          $t('teams.team.locations.location.hive.inspections.create.title')
        }}</VaCardTitle>
        <VaCardContent>
          <VaForm ref="formRef" tag="form" class="flex flex-col gap-4">
            <VaSwitch
              v-model="form.verifiedByUser"
              class="mt-4"
              size="small"
              :label="
                $t(
                  'teams.team.locations.location.hive.inspections.inspection.verified'
                )
              "
            />
            <VaTextarea
              v-model="form.notes"
              :label="
                $t(
                  'teams.team.locations.location.hive.inspections.inspection.notes'
                )
              "
              :placeholder="
                $t(
                  'teams.team.locations.location.hive.inspections.inspection.notes'
                )
              "
              autosize
              :max-rows="10"
              required-mark
              counter
              :max-length="4096"
              :rules="[
                validation.required(
                  $t(
                    'teams.team.locations.location.hive.inspections.inspection.notes'
                  )
                ),
                validation.max(
                  $t(
                    'teams.team.locations.location.hive.inspections.inspection.notes'
                  ),
                  4069
                )
              ]"
              required
            />
            <div>
              <VaDateInput
                v-model="form.timestamp"
                close-on-change
                first-weekday="Monday"
                :format-date="$d"
                strict-bind-input-value
                :rules="[validation.dateIsPast()]"
              />
              <VaTimeInput
                v-model="form.timestamp"
                close-on-change
                strict-bind-input-value
                :rules="[validation.dateIsPast()]"
              />
            </div>
          </VaForm>
          <VaRating v-model="form.impression" color="warning" class="my-8" />
          <VaButton
            color="success"
            :disabled="isLoading || !isValid"
            :loading="isLoading"
            @click="createInspection"
            >{{ $t('create') }}</VaButton
          >
        </VaCardContent></VaCard
      >
    </div>
  </div>
</template>

<style scoped></style>
