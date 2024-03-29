<script setup lang="ts">
import { useForm } from 'vuestic-ui';

definePageMeta({
  middleware: 'guest',
  layout: 'auth',
  title: 'register.title',
  authName: 'register'
});
defineI18nRoute({
  paths: {
    en: '/register',
    de: '/registrieren'
  }
});
const { fetch } = useUserSession();
const router = useRouter();
const localePath = useLocalePath();
const { isValid, resetValidation } = useForm('formRef');
const validation = useValidation();

const { passwordMinLength } = useRuntimeConfig().public;
const form = reactive({
  email: '',
  password: '',
  accept: false,
  name: ''
});

const error = ref('');

async function submit() {
  error.value = '';
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form
    });
    await fetch();
    router.push(localePath('/'));
    return;
  } catch (e) {
    // TODO: Handle error
    error.value = 'Already exists!';
  }
  form.password = '';
  resetValidation();
}
</script>

<template>
  <VaForm
    ref="formRef"
    tag="form"
    class="flex flex-col items-baseline gap-6"
    @submit.prevent="submit"
  >
    <VaInput
      v-model="form.name"
      type="text"
      autocomplete="name"
      :label="$t('auth.name')"
      :placeholder="$t('auth.name')"
      maxlength="64"
      :rules="[
        validation.required($t('auth.name')),
        validation.max($t('auth.name'), 64)
      ]"
      required
    >
      <template #prependInner>
        <VaIcon name="person" color="secondary" />
      </template>
    </VaInput>
    <VaInput
      v-model="form.email"
      type="email"
      :label="$t('auth.email')"
      autocomplete="email"
      :rules="[validation.required($t('auth.email'))]"
      :placeholder="$t('auth.email')"
      required
    >
      <template #prependInner>
        <VaIcon name="mail_outline" color="secondary" />
      </template>
    </VaInput>

    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
        v-model="form.password"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        :label="$t('auth.password')"
        :placeholder="$t('auth.password')"
        :rules="[
          validation.required($t('auth.password')),
          validation.min($t('auth.password'), passwordMinLength)
        ]"
        autocomplete="current-password"
        :minlength="passwordMinLength"
        required
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
              :name="isPasswordVisible.value ? 'visibility_off' : 'visibility'"
              color="primary"
            />
          </VaButton>
        </template>
      </VaInput>
    </VaValue>
    <VaSwitch
      v-model="form.accept"
      size="small"
      :label="$t('auth.accept')"
      :rules="[(v) => v || 'You must agree']"
      required
    />

    <VaAlert
      v-if="error.length > 0"
      color="danger"
      class="w-full text-center"
      >{{ error }}</VaAlert
    >
    <VaButton type="submit" :disabled="!isValid">{{
      $t('register.title')
    }}</VaButton>
  </VaForm>
</template>
