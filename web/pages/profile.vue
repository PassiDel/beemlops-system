<script setup lang="ts">
import type { Ref } from 'vue';
import { useForm } from 'vuestic-ui';
import type { UserFullDto } from '../server/dto/user';

definePageMeta({
  middleware: 'auth',
  title: 'profile.settings.title'
});
const { passwordMinLength } = useRuntimeConfig().public;

const { isValid, resetValidation } = useForm('formRef');
const validation = useValidation();

const { pending, data: _data } = await useFetch(`/api/users/me`);
const data = _data as unknown as Ref<UserFullDto>;

const form = reactive({
  name: data.value.name,
  email: data.value.email,
  password: ''
});

const isNew = computed(
  () =>
    form.name !== data.value.name ||
    form.email !== data.value.email ||
    form.password
);

async function submit() {
  await $fetch('/api/auth/profile', {
    method: 'POST',
    body: form
  });
  resetValidation();
}
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <VaInnerLoading
      class="col-span-12 lg:col-span-6 xl:col-span-4"
      :loading="pending"
    >
      <VaCard stripe :stripe-color="pending ? 'warning' : 'success'">
        <VaCardTitle>{{ $t('profile.settings.card.title') }}</VaCardTitle>
        <VaCardContent>
          <VaForm
            ref="formRef"
            tag="form"
            class="flex flex-col items-baseline gap-6"
            @submit.prevent="submit"
          >
            <VaInput
              v-model="form.name"
              type="text"
              class="w-full"
              :label="$t('auth.name')"
              autocomplete="name"
              :rules="[
                validation.required($t('auth.name')),
                validation.max($t('auth.name'), 64)
              ]"
              :placeholder="$t('auth.name')"
              required
              :clearable="form.name !== data.name"
              :clear-value="data.name"
              clearable-icon="restart_alt"
            >
              <template #prependInner>
                <VaIcon name="mail_outline" color="secondary" />
              </template>
            </VaInput>
            <VaInput
              v-model="form.email"
              type="email"
              autocomplete="email"
              class="w-full"
              :label="$t('auth.email')"
              :rules="[validation.required($t('auth.email'))]"
              :placeholder="$t('auth.email')"
              required
              :clearable="form.email !== data.email"
              :clear-value="data.email"
              clearable-icon="restart_alt"
            >
              <template #prependInner>
                <VaIcon name="mail_outline" color="secondary" />
              </template>
            </VaInput>

            <VaValue v-slot="isPasswordVisible" :default-value="false">
              <VaInput
                v-model="form.password"
                class="w-full"
                :type="isPasswordVisible.value ? 'text' : 'password'"
                :label="$t('auth.password')"
                :placeholder="$t('auth.password')"
                :rules="[
                  validation.required($t('auth.password')),
                  validation.min($t('auth.password'), passwordMinLength)
                ]"
                autocomplete="new-password"
                :minlength="passwordMinLength"
                :clearable="!!form.password"
              >
                <template #prependInner>
                  <VaIcon name="key" color="secondary" />
                </template>
                <template #appendInner>
                  <VaButton
                    v-if="form.password"
                    preset="plain"
                    :title="
                      $t(
                        isPasswordVisible.value
                          ? 'auth.hidePassword'
                          : 'auth.showPassword'
                      )
                    "
                    @click="isPasswordVisible.value = !isPasswordVisible.value"
                  >
                    <VaIcon
                      :name="
                        isPasswordVisible.value
                          ? 'visibility_off'
                          : 'visibility'
                      "
                      color="primary"
                    />
                  </VaButton>
                </template>
              </VaInput>
            </VaValue>
            <VaButton type="submit" :disabled="!isValid || !isNew">{{
              $t('login.title')
            }}</VaButton>
          </VaForm>
        </VaCardContent>
      </VaCard>
    </VaInnerLoading>
  </div>
</template>

<style scoped></style>
