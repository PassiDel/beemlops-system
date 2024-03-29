<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  title: 'teams.title'
});
const showModal = ref(false);
const localePath = useLocalePath();

const { data: teams, pending, refresh } = await useFetch('/api/teams');
</script>

<template>
  <div>
    <div class="flex gap-8 mb-8">
      <h1 class="text-3xl">{{ $t('teams.title') }}</h1>
      <VaButton color="primary" :disabled="pending" @click="refresh"
        ><VaIcon name="refresh"
      /></VaButton>
      <VaButton color="success" @click="showModal = !showModal"
        ><VaIcon name="add"
      /></VaButton>
      <CreateTeam v-model:show-modal="showModal" @update-list="refresh" />
    </div>
    <div v-if="!pending && teams" class="grid grid-cols-12 gap-6">
      <VaCard
        v-for="team in teams"
        :key="team.id"
        class="col-span-12 md:col-span-6 xl:col-span-4"
        stripe
        :stripe-color="team.isCreator ? 'success' : 'primary'"
        :to="localePath(`/teams/${team.slug}`)"
      >
        <VaCardTitle class="overflow-hidden overflow-ellipsis w-full">{{
          team.name
        }}</VaCardTitle>
        <VaCardContent>
          <h2
            class="text-2xl w-full overflow-hidden overflow-ellipsis"
            :title="team.name"
          >
            {{ team.name }}
          </h2>
          <h3
            class="w-full overflow-hidden overflow-ellipsis"
            :title="team.creator.name"
          >
            {{ $t('teams.team.creator_name', { name: team.creator.name }) }}
          </h3>
          <h3 :title="new Date(team.createdAt).toISOString()">
            {{
              $t('teams.team.created_at', {
                data: $d(new Date(team.createdAt))
              })
            }}
          </h3>
          <h3>{{ $t('teams.team.members') }}</h3>
          <VaAvatarGroup
            :options="
              team.users.map((u) => ({
                src: u.profilePicture,
                alt: u.name,
                title: u.name
              }))
            "
            :max="5"
          />
        </VaCardContent>
        <VaCardActions align="between">
          <VaButton color="success">{{ $t('open') }}</VaButton>
          <VaButton
            v-if="team.isCreator"
            color="warning"
            :to="localePath(`/teams/${team.slug}/edit`)"
            >{{ $t('edit') }}</VaButton
          >
        </VaCardActions>
      </VaCard>
    </div>
  </div>
</template>

<style scoped></style>
