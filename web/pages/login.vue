<script setup lang="ts">
import { useForm } from 'vuestic-ui';

definePageMeta({
  middleware: 'guest',
  layout: 'auth',
  title: 'login.title',
  authName: 'login'
});
defineI18nRoute({
  paths: {
    en: '/login',
    de: '/anmelden'
  }
});
const { fetch } = useUserSession();
const router = useRouter();
const localePath = useLocalePath();
const { isValid, resetValidation } = useForm('formRef');

const { passwordMinLength } = useRuntimeConfig().public;
const form = reactive({
  email: '',
  password: ''
});

const error = ref('');

async function submit() {
  error.value = '';
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    });
    await fetch();
    router.push(localePath('/'));
    return;
  } catch (e) {
    // TODO: Handle error
    error.value = 'Wrong credentials';
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
      v-model="form.email"
      type="email"
      :label="$t('auth.email')"
      autocomplete="email"
      :rules="[(value) => (value && value.length > 0) || 'Email is required']"
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
          (value) => (value && value.length > 0) || 'Password is required',
          (value) =>
            (value && value.length >= passwordMinLength) ||
            `Password has to be ${passwordMinLength} chars long`
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
    <VaAlert
      v-if="error.length > 0"
      color="danger"
      class="w-full text-center"
      >{{ error }}</VaAlert
    >
    <VaButton type="submit" :disabled="!isValid">{{
      $t('login.title')
    }}</VaButton>
  </VaForm>
</template>
