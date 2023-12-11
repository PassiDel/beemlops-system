<script setup lang="ts">
const { data, refresh, pending } = await useFetch('/api/cache');
definePageMeta({
  title: 'cache.title'
});

const infoTiles = ref([
  {
    color: 'success',
    value: '803',
    text: 'commits'
  },
  {
    color: 'danger',
    value: '57',
    text: 'components'
  },
  {
    color: 'info',
    value: '5',
    text: 'teamMembers'
  }
]);
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <VaInnerLoading class="col-span-12 lg:col-span-6" :loading="pending">
      <VaCard stripe :stripe-color="pending ? 'warning' : 'success'">
        <VaCardTitle>{{ $t('cache.card.title') }}</VaCardTitle>
        <VaCardContent>
          {{ data }}
        </VaCardContent>
        <VaCardActions>
          <VaButton :disabled="pending" @click.prevent="refresh()">
            {{ $t('refresh') }}
          </VaButton>
        </VaCardActions>
      </VaCard>
    </VaInnerLoading>
    <div class="col-span-12 lg:col-span-6 flex flex-wrap">
      <div class="w-full grid grid-cols-12 gap-6">
        <va-card
          v-for="(info, idx) in infoTiles"
          :key="idx"
          class="col-span-12 sm:col-span-4 mb-8"
          :color="info.color"
        >
          <va-card-content>
            <h2 class="text-3xl font-bold m-0 text-white">{{ info.value }}</h2>
            <p class="text-white">{{ info.text }}</p>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
