<script setup lang="ts">
const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void;
}>();

const createDisabled = computed(() => false);

async function createTeam() {
  emit('update:showModal', false);
}
</script>

<template>
  <VaModal
    :model-value="props.showModal"
    blur
    hide-default-actions
    @update:model-value="(v) => emit('update:showModal', v)"
  >
    <template #footer>
      <VaButton preset="secondary" @click="emit('update:showModal', false)"
        >Close</VaButton
      >
      <VaButton
        class="ml-4"
        color="success"
        :disabled="createDisabled"
        @click="createTeam"
        >Create</VaButton
      >
    </template>
  </VaModal>
</template>

<style scoped></style>
