<script setup lang="ts">
import type { Ref } from 'vue';
import type { TeamLocationHiveDto } from '../../../server/dto/team';

definePageMeta({
  middleware: 'auth',
  title: 'teams.team.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]',
    de: '/teams/[teamid]'
  }
});

const localePath = useLocalePath();
const { teamid } = useRoute().params;

const {
  data: _data,
  error,
  pending,
  refresh
} = await useFetch(`/api/teams/${teamid}`, {
  lazy: true
});
if (error && error.value) {
  throw createError(error.value);
}

const team = _data as Ref<TeamLocationHiveDto>;
</script>

<template>
  <div>
    <div v-if="!pending && team">
      <div class="flex gap-8 mb-8 w-full">
        <h1 class="text-3xl overflow-hidden overflow-ellipsis">
          {{ team.name }}
        </h1>
        <VaButton color="primary" :disabled="pending" @click="refresh"
          ><VaIcon name="refresh"
        /></VaButton>
        <VaButton
          v-if="team.isCreator"
          :disabled="pending"
          color="warning"
          :to="`/teams/${teamid}/edit`"
          ><VaIcon name="edit"
        /></VaButton>
      </div>
      <div v-for="location in team.locations" :key="`l-${location.id}`">
        <VaDivider
          orientation="left"
          style="--va-divider-margin: 2em; --va-divider-text-font-size: 2rem"
        >
          <NuxtLink
            class="px-2 hover:underline"
            :to="localePath(`/teams/${teamid}/locations/${location.slug}`)"
            >{{ location.name }}</NuxtLink
          >
        </VaDivider>

        <div class="grid grid-cols-12 gap-6 mb-20">
          <VaCard
            v-for="hive in location.hives"
            :key="`h-${hive.id}`"
            class="col-span-12 md:col-span-6 xl:col-span-4"
            stripe
            stripe-color="success"
            :to="
              localePath(
                `/teams/${teamid}/locations/${location.slug}/${hive.slug}`
              )
            "
          >
            <VaCardTitle>{{ hive.name }}</VaCardTitle>
            <VaCardContent>
              <h2 class="text-2xl">{{ hive.name }}</h2>
            </VaCardContent>

            <VaCardActions align="between">
              <VaButton color="success">{{ $t('open') }}</VaButton>
              <VaButton
                v-if="team.isCreator"
                color="warning"
                :to="
                  localePath(
                    `/teams/${teamid}/locations/${location.slug}/${hive.slug}/edit`
                  )
                "
                >{{ $t('edit') }}</VaButton
              >
            </VaCardActions>
          </VaCard>
          <VaCard
            v-if="location.hives.length <= 0"
            class="col-span-12 md:col-span-6 md:col-start-4 xl:col-span-4 xl:col-start-5"
            stripe
            stripe-color="warning"
          >
            <VaCardTitle>{{ $t('teams.team.no_hive_title') }}</VaCardTitle>
            <VaCardContent>
              <h2 class="text-2xl">{{ $t('teams.team.no_hive_title') }}</h2>
              <span v-if="team.isCreator">{{
                $t('teams.team.no_hive_content')
              }}</span>
            </VaCardContent>

            <VaCardActions align="between">
              <VaValue v-slot="showModal">
                <VaButton
                  v-if="team.isCreator"
                  color="success"
                  @click="showModal.value = !showModal.value"
                  >{{ $t('create') }}</VaButton
                ><CreateHive
                  v-model:show-modal="showModal.value"
                  :team-slug="team.slug"
                  :location-slug="location.slug"
                  :location-name="location.name"
                  @update-list="refresh"
                />
              </VaValue>
            </VaCardActions>
          </VaCard>
        </div>
      </div>
      <div v-if="team.locations.length <= 0">
        <VaDivider
          orientation="left"
          style="--va-divider-margin: 2em; --va-divider-text-font-size: 2rem"
        >
          {{ $t('teams.team.no_location') }}
        </VaDivider>

        {{ $t('teams.team.no_location') }}
      </div>
    </div>
    <VaSkeletonGroup v-else>
      <div class="flex gap-8 mb-8 w-full">
        <VaSkeleton tag="h1" variant="text" class="text-3xl"></VaSkeleton>
        <VaButton color="primary" :disabled="pending" @click="refresh"
          ><VaIcon name="refresh"
        /></VaButton>
      </div>

      <VaDivider
        orientation="left"
        style="--va-divider-margin: 2em; --va-divider-text-font-size: 2rem"
      >
      </VaDivider>
      <div class="grid grid-cols-12 gap-6 mb-20">
        <VaCard
          class="col-span-12 md:col-span-6 xl:col-span-4"
          stripe
          stripe-color="primary"
        >
          <VaCardTitle><VaSkeleton variant="text" /></VaCardTitle>
          <VaCardContent>
            <VaSkeleton variant="text" tag="h2" class="text-2xl" />
          </VaCardContent>

          <VaCardActions align="between">
            <VaButton color="success" disabled>{{ $t('open') }}</VaButton>
          </VaCardActions>
        </VaCard>
      </div>
    </VaSkeletonGroup>
  </div>
</template>

<style scoped></style>
