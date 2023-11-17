<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
});
const { fetch } = useUserSession();
const router = useRouter();
const localePath = useLocalePath();

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
}
</script>

<template>
  <div>
    <h1>Login</h1>
    <p>{{ error }}</p>
    <form @submit.prevent="submit">
      <input
        v-model="form.email"
        type="email"
        autocomplete="email"
        placeholder="Email"
        required
      />
      <input
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        placeholder="Password"
        :minlength="passwordMinLength"
        required
      />
      <button type="submit">Login</button>
    </form>
    <NuxtLink :to="localePath('/register')">Register</NuxtLink>
  </div>
</template>
