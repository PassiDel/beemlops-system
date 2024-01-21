<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations',
    de: '/teams/[teamid]/orte'
  }
});

const localePath = useLocalePath();
const { teamid } = useRoute().params;

const showModal = ref(false);
const {
  data: team,
  error,
  pending,
  refresh
} = await useFetch(`/api/teams/${teamid}/locations`, {
  lazy: true
});
if (error && error.value) {
  throw createError(error.value);
}
</script>

<template>
  <div>
    <div v-if="!pending && team">
      <div class="flex gap-8 mb-8 w-full">
        <h1 class="text-3xl overflow-hidden overflow-ellipsis">
          {{ team.name }}
        </h1>
        <VaButton
          v-if="team.isCreator"
          color="success"
          @click="showModal = !showModal"
          ><VaIcon name="add"
        /></VaButton>
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
        <CreateLocation
          v-model:show-modal="showModal"
          :team-slug="team.slug"
          :team-name="team.name"
          @update-list="refresh"
        />
      </div>
      <div class="grid grid-cols-12 gap-6">
        <VaCard
          v-for="location in team.locations"
          :key="`l-${location.id}`"
          class="col-span-12 md:col-span-6 xl:col-span-4"
          stripe
          stripe-color="success"
          :to="localePath(`/teams/${teamid}/locations/${location.slug}`)"
        >
          <VaCardTitle>{{ location.name }}</VaCardTitle>
          <VaCardContent>
            <h2 class="text-2xl w-full overflow-hidden overflow-ellipsis">
              {{ location.name }}
            </h2>
          </VaCardContent>

          <VaCardActions align="between">
            <VaButton color="success">{{ $t('open') }}</VaButton>
            <VaButton
              v-if="team.isCreator"
              color="warning"
              :to="
                localePath(`/teams/${teamid}/locations/${location.slug}/edit`)
              "
              >{{ $t('edit') }}</VaButton
            >
          </VaCardActions>
        </VaCard>
        <VaCard
          v-if="team.locations.length <= 0"
          class="col-span-12 md:col-span-6 md:col-start-4 xl:col-span-4 xl:col-start-5"
          stripe
          stripe-color="warning"
        >
          <VaCardTitle>{{ $t('teams.team.no_location_title') }}</VaCardTitle>
          <VaCardContent>
            <h2 class="text-2xl">{{ $t('teams.team.no_location_title') }}</h2>
            <span v-if="team.isCreator">{{
              $t('teams.team.no_location_content')
            }}</span>
          </VaCardContent>

          <VaCardActions align="between">
            <VaButton
              v-if="team.isCreator"
              color="success"
              @click="showModal = !showModal"
              >{{ $t('create') }}</VaButton
            >
          </VaCardActions>
        </VaCard>
      </div>
    </div>
    <VaSkeletonGroup v-else>
      <div class="flex gap-8 mb-8 w-full">
        <VaSkeleton tag="h1" variant="text" class="text-3xl"></VaSkeleton>
        <VaButton color="primary" :disabled="pending" @click="refresh"
          ><VaIcon name="refresh"
        /></VaButton>
      </div>

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
