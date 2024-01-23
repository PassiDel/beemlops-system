<script setup lang="ts">
import { useForm } from 'vuestic-ui';
import { createSlug } from '@/server/utils/slug';
import useValidation from '@/composables/useValidation';

const props = defineProps<{
  showModal: boolean;
  teamSlug: string;
  teamName: string;
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
  team: props.teamSlug,
  redirect: false
});

async function createLocation() {
  try {
    const { slug } = await $fetch('/api/locations', {
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
    await router.push(localePath(`/teams/${props.teamSlug}/locations/${slug}`));
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
    await $fetch('/api/locations/check-slug', {
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
        @click="createLocation"
        >{{ $t('create') }}</VaButton
      >
    </template>
    <h1 class="text-2xl mb-4">
      {{ $t('teams.team.locations.location.create_new') }}
    </h1>
    <p class="mb-4 w-full overflow-hidden overflow-ellipsis">
      {{
        $t('teams.team.locations.location.create_for', {
          name: props.teamName
        })
      }}
    </p>
    <VaForm ref="formRef" tag="form" class="flex flex-col">
      <VaInput
        v-model="form.name"
        type="text"
        :label="$t('teams.team.locations.location.name')"
        :placeholder="$t('teams.team.locations.location.name')"
        counter
        :max-length="64"
        required-mark
        :rules="[
          validation.required($t('teams.team.locations.location.name')),
          validation.max($t('teams.team.locations.location.name'), 64)
        ]"
        required
        @change="form.slug = createSlug(form.name)"
      >
        <template #prependInner>
          <VaIcon name="badge" color="secondary" />
        </template>
      </VaInput>
      <VaInput
        v-model="form.slug"
        type="text"
        :label="$t('teams.team.locations.location.slug')"
        :placeholder="$t('teams.team.locations.location.slug')"
        counter
        :max-length="64"
        required-mark
        :error-messages="slugError ? $t(slugError) : []"
        :error="!!slugError"
        :rules="[
          validation.required($t('teams.team.locations.location.slug')),
          validation.max($t('teams.team.locations.location.slug'), 64),
          validation.min($t('teams.team.locations.location.slug'), 7)
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
