<script setup lang="ts">
import type { Ref } from 'vue';
import type { UserDto, UserFullDto } from '../../server/dto/user';
definePageMeta({
  middleware: 'auth'
});

const { id } = useRoute().params;

const { data: _user, error } = await useFetch(`/api/users/${id}`);

const user = _user as unknown as Ref<UserDto | UserFullDto>;
</script>

<template>
  <div v-if="!error && user">
    <h1>{{ user.name }}</h1>
    <h2 v-if="(user as UserFullDto).email">
      {{ (user as UserFullDto).email }}
    </h2>
    <p>Created at: {{ $d(new Date(user.createdAt)) }}</p>
  </div>
  <div v-else>
    <h1>Not found!</h1>
    <p>{{ error?.statusCode }}</p>
  </div>
</template>

<style scoped></style>
