<script setup lang="ts">
import { useForm } from 'vuestic-ui';
import { createSlug } from '@/server/utils/slug';
import useValidation from '@/composables/useValidation';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void;
  (e: 'update-list'): void;
}>();

const router = useRouter();
const localePath = useLocalePath();

const validation = useValidation();

const { isValid, isLoading, resetValidation } = useForm('formRef');
const form = reactive({
  name: '',
  slug: '',
  redirect: false
});

async function createTeam() {
  try {
    const { slug } = await $fetch('/api/teams', {
      method: 'POST',
      body: form
    });
    form.slug = '';
    form.name = '';
    resetValidation();
    emit('update:showModal', false);
    if (!form.redirect) {
      emit('update-list');
      return;
    }
    await router.push(localePath(`/teams/${slug}`));
  } catch (e) {
    const code = (e as { statusCode: number })?.statusCode || 400;

    if (code === 409) {
      slugError.value = 'validation.taken';
      return;
    }
    slugError.value = 'Error!';
  }
}
const slugError = ref(null as string | null);
async function checkSlug() {
  try {
    await $fetch('/api/teams/check-slug', {
      method: 'POST',
      body: {
        slug: form.slug
      }
    });
    slugError.value = null;
  } catch (e) {
    const code = (e as { statusCode: number })?.statusCode || 400;
    slugError.value = code === 409 ? 'validation.taken' : 'validation.invalid';
  }
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
      <VaProgressBar v-show="isLoading" class="mb-2" indeterminate />
      <VaButton preset="secondary" @click="emit('update:showModal', false)">{{
        $t('close')
      }}</VaButton>
      <VaButton
        class="ml-4"
        color="success"
        :disabled="isLoading || !isValid"
        :loading="isLoading"
        @click="createTeam"
        >{{ $t('create') }}</VaButton
      >
    </template>
    <h1 class="text-2xl mb-4">{{ $t('teams.team.create_new') }}</h1>
    <VaForm ref="formRef" tag="form" class="flex flex-col">
      <VaInput
        v-model="form.name"
        type="text"
        :label="$t('teams.team.name')"
        :placeholder="$t('teams.team.name')"
        counter
        :max-length="64"
        :rules="[
          validation.required($t('teams.team.name')),
          validation.max($t('teams.team.name'), 64)
        ]"
        required
        @change="form.slug = createSlug(form.name)"
      >
        <template #prependInner>
          <VaIcon name="group" color="secondary" />
        </template>
      </VaInput>
      <VaInput
        v-model="form.slug"
        type="text"
        :label="$t('teams.team.slug')"
        :placeholder="$t('teams.team.slug')"
        counter
        :max-length="64"
        :error-messages="slugError ? $t(slugError) : []"
        :error="!!slugError"
        :rules="[
          validation.required($t('teams.team.slug')),
          validation.max($t('teams.team.slug'), 64),
          validation.min($t('teams.team.slug'), 7)
        ]"
        required
        @change="checkSlug"
      >
        <template #prependInner>
          <VaIcon name="link" color="secondary" />
        </template>
        <template #appendInner>
          <VaButton
            :disabled="!form.name"
            preset="plain"
            :title="$t('regenerate')"
            @click="
              form.slug = createSlug(form.name);
              checkSlug();
            "
          >
            <VaIcon name="refresh" color="primary" />
          </VaButton>
        </template>
      </VaInput>
      <VaSwitch
        v-model="form.redirect"
        class="mt-4"
        size="small"
        :label="$t('redirect_after_creation')"
      />
    </VaForm>
  </VaModal>
</template>

<style scoped></style>
