<script setup lang="ts">
import { useForm } from 'vuestic-ui';
import { createSlug } from '~/server/utils/slug';
import type { TeamLocationHiveDto } from '~/server/dto/team';

definePageMeta({
  middleware: 'auth',
  title: 'teams.team.edit.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/edit',
    de: '/teams/[teamid]/bearbeiten'
  }
});

const { isValid, resetValidation } = useForm('formRef');
const validation = useValidation();

const { t } = useI18n();
const { confirm } = useModal();
const router = useRouter();
const localePath = useLocalePath();

const { teamid } = useRoute().params;

const { error, data: _data, refresh } = await useFetch(`/api/teams/${teamid}`);

const data = _data as Ref<TeamLocationHiveDto | null>;
if ((error && error.value) || !data.value || !data.value?.isCreator) {
  throw createError(error.value || { statusCode: 403 });
}

const form = reactive({
  name: data.value.name,
  slug: data.value.slug
});

const isNew = computed(
  () => form.name !== data.value?.name || form.slug !== data.value?.slug
);

async function submit() {
  await $fetch(`/api/teams/${teamid}`, {
    method: 'POST',
    body: form
  });
  resetValidation();
  await router.push(localePath(`/teams/${form.slug || teamid}`));
}

const userForm = reactive({
  email: ''
});
async function addUser() {
  await $fetch(`/api/teams/${teamid}/add`, {
    method: 'POST',
    body: userForm
  });
  resetValidation();
  await refresh();
}
async function promoteUser(userid: number) {
  const confirmed = await confirm(t('validation.confirm'));
  if (!confirmed) {
    return;
  }
  await $fetch(`/api/teams/${teamid}/${userid}/promote`, {
    method: 'POST'
  });
  resetValidation();
  await router.push(localePath(`/teams/${teamid}`));
}
async function deleteUser(userid: number) {
  const confirmed = await confirm(t('validation.confirm'));
  if (!confirmed) {
    return;
  }
  await $fetch(`/api/teams/${teamid}/${userid}`, {
    method: 'DELETE'
  });
  resetValidation();
  await refresh();
}

const slugError = ref(null as string | null);
async function checkSlug() {
  try {
    await $fetch('/api/teams/check-slug', {
      method: 'POST',
      body: {
        slug: form.slug,
        id: data.value?.id
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
  <div class="grid grid-cols-12 gap-6">
    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-4"
      stripe
      stripe-color="success"
    >
      <VaCardContent>
        <VaForm
          ref="formRef"
          tag="form"
          class="flex flex-col items-baseline gap-6"
          @submit.prevent="submit"
        >
          <VaInput
            v-model="form.name"
            :label="$t('teams.team.name')"
            :placeholder="$t('teams.team.name')"
            required-mark
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
            required-mark
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
                <VaIcon name="refresh" color="primary" /> </VaButton
            ></template>
          </VaInput>

          <VaButton type="submit" :disabled="!isValid || !isNew">{{
            $t('save')
          }}</VaButton>
        </VaForm>
      </VaCardContent></VaCard
    >

    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-4"
      stripe
      stripe-color="success"
    >
      <VaCardContent class="flex flex-col justify-between h-full">
        <VaList>
          <VaListLabel> {{ $t('teams.team.members') }} </VaListLabel>

          <VaListItem
            v-for="(user, id) in data?.users"
            :key="id"
            class="list__item"
          >
            <VaListItemSection avatar>
              <VaAvatar
                :src="user.profilePicture"
                :title="user.name"
                :alt="user.name"
              />
            </VaListItemSection>

            <VaListItemSection>
              <VaListItemLabel>
                {{ user.name }}
              </VaListItemLabel>
            </VaListItemSection>

            <VaListItemSection v-if="user.id !== data?.creator.id" icon>
              <VaButtonGroup>
                <VaButton
                  icon="star"
                  color="warning"
                  @click="promoteUser(user.id)"
                />
                <VaButton
                  icon="close"
                  color="danger"
                  @click="deleteUser(user.id)"
                />
              </VaButtonGroup>
            </VaListItemSection>
          </VaListItem>
        </VaList>

        <VaForm
          ref="newMemberRef"
          tag="form"
          class="flex flex-col items-baseline gap-6"
          @submit.prevent="addUser"
        >
          <VaInput
            v-model="userForm.email"
            :label="$t('auth.email')"
            :placeholder="$t('auth.email')"
            autocomplete="email"
            :rules="[validation.required($t('auth.email'))]"
            required
          >
            <template #append>
              <VaButton icon="add" color="" @click="addUser()"> </VaButton>
            </template>
            <template #prependInner>
              <VaIcon name="group" color="secondary" />
            </template>
          </VaInput>
        </VaForm> </VaCardContent
    ></VaCard>
  </div>
</template>

<style scoped></style>
