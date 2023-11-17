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
}
</script>

<template>
  <div>
    <h1>Register</h1>
    <p>{{ error }}</p>
    <form @submit.prevent="submit">
      <input
        v-model="form.name"
        type="text"
        autocomplete="name"
        placeholder="Name"
        maxlength="64"
        required
      />
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
        autocomplete="new-password"
        placeholder="Password"
        :minlength="passwordMinLength"
        required
      />
      <input v-model="form.accept" type="checkbox" required />
      <button type="submit">Register</button>
    </form>
    <NuxtLink :to="localePath('/login')">Login</NuxtLink>
  </div>
</template>
