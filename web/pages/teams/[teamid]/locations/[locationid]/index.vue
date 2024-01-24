<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.location.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations/[locationid]',
    de: '/teams/[teamid]/orte/[locationid]'
  }
});

const localePath = useLocalePath();
const { teamid, locationid } = useRoute().params;

const {
  data: location,
  error,
  pending,
  refresh
} = await useFetch(`/api/locations/${locationid}`, {
  lazy: true
});
if (error && error.value) {
  throw createError(error.value);
}
const showModal = ref(false);
</script>

<template>
  <div>
    <div v-if="!pending && location">
      <div class="flex gap-8 mb-8 w-full">
        <h1 class="text-3xl overflow-hidden overflow-ellipsis">
          {{ location.name }}
        </h1>
        <VaButton color="primary" :disabled="pending" @click="refresh"
          ><VaIcon name="refresh"
        /></VaButton>
        <VaButton
          v-if="location.isCreator"
          color="success"
          :disabled="pending"
          @click="showModal = !showModal"
        ><VaIcon name="add"
        /></VaButton>
        <VaButton
          v-if="location.isCreator"
          :disabled="pending"
          color="warning"
          :to="`/teams/${teamid}/locations/${locationid}/edit`"
          ><VaIcon name="edit"
        /></VaButton>
        <CreateHive
          v-model:show-modal="showModal"
          :team-slug="typeof teamid === 'string' ? teamid : teamid[0]"
          :location-slug="location.slug"
          :location-name="location.name"
          @update-list="refresh"
        />
      </div>
      <div v-for="hive in location.hives" :key="`h-${hive.id}`">
        <VaDivider
          orientation="left"
          style="--va-divider-margin: 2em; --va-divider-text-font-size: 2rem"
        >
          <NuxtLink
            class="px-2 hover:underline"
            :to="
              localePath(
                `/teams/${teamid}/locations/${location.slug}/${hive.slug}`
              )
            "
            >{{ hive.name }}</NuxtLink
          >
        </VaDivider>

        <div class="grid grid-cols-12 gap-6 mb-20">
          <!-- TODO: add real components -->
          <VaCard
            class="col-span-12 md:col-span-6 xl:col-span-4"
            stripe
            stripe-color="success"
          >
            <VaCardTitle>Graph</VaCardTitle>
            <VaCardContent> dummy </VaCardContent>
          </VaCard>
          <VaCard class="col-span-12 md:col-span-6 xl:col-span-4">
            <VaCardTitle>Meta</VaCardTitle>
            <VaCardContent> dummy </VaCardContent>
          </VaCard>
          <VaCard
            class="col-span-12 md:col-span-6 md:col-start-4 xl:col-span-4"
            stripe
            stripe-color="primary"
          >
            <VaCardTitle>Content</VaCardTitle>
            <VaCardContent> dummy </VaCardContent>
          </VaCard>
        </div>
      </div>
      <div v-if="location.hives.length <= 0">
        <VaDivider
          orientation="left"
          style="--va-divider-margin: 2em; --va-divider-text-font-size: 2rem"
        >
          {{ $t('teams.team.no_hive_title') }}
        </VaDivider>

        {{ $t('teams.team.no_hive_content') }}
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
