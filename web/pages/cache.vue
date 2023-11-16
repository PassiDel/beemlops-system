<script setup lang="ts">
const { data, refresh, pending } = await useFetch('/api/cache');
</script>

<template>
  <div>
    <h1>{{ data }}</h1>
    <button :disabled="pending" @click.prevent="refresh()">
      {{ $t('refresh') }}
    </button>
  </div>
</template>

<style scoped></style>
