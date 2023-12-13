<script setup lang="ts">
import type { Ref } from 'vue';
import type { UserDto, UserFullDto } from '../../server/dto/user';
definePageMeta({
  middleware: 'auth',
  title: 'users.user.title'
});

const { id } = useRoute().params;

const {
  data: _user,
  error,
  pending
} = await useFetch(`/api/users/${id}`, { lazy: true });

const user = _user as unknown as Ref<UserDto | UserFullDto>;
</script>

<template>
  <div :aria-busy="pending">
    <VaSkeletonGroup v-if="pending" animation="wave" :delay="0">
      <VaCard stripe stripe-color="warning">
        <VaCardTitle>{{ $t('users.user.card.title') }}</VaCardTitle>
        <VaCardContent>
          <VaSkeleton tag="h1" variant="text" class="va-h1" />
          <VaSkeleton variant="text" class="va-text" />
        </VaCardContent>
      </VaCard>
    </VaSkeletonGroup>
    <VaCard v-else stripe stripe-color="success">
      <VaCardTitle>{{ $t('users.user.card.title') }}</VaCardTitle>
      <VaCardContent v-if="!error && user">
        <h1
          class="va-h1 w-full overflow-hidden overflow-ellipsis"
          :title="user.name"
        >
          {{ user.name }}
        </h1>
        <h2 v-if="(user as UserFullDto).email" class="va-h2">
          {{ (user as UserFullDto).email }}
        </h2>
        <p :title="new Date(user.createdAt).toISOString()">
          Created at: {{ $d(new Date(user.createdAt)) }}
        </p>
      </VaCardContent>
      <VaCardContent v-else>
        <h1>Not found!</h1>
        <p>{{ error?.statusCode }}</p>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped></style>
