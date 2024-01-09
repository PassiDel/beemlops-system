<script setup lang="ts">
const localePath = useLocalePath();
const { data: users, pending } = await useFetch('/api/users');
definePageMeta({
  title: 'users.title'
});
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <VaInnerLoading class="col-span-12" :loading="pending">
      <VaCard stripe :stripe-color="pending ? 'warning' : 'success'">
        <VaCardTitle>{{ $t('users.card.title') }}</VaCardTitle>
        <VaCardContent>
          <VaList v-if="!pending">
            <VaListItem
              v-for="user in users"
              :key="user.id"
              :to="localePath(`/users/${user.id}`)"
            >
              <VaListItemSection avatar>
                <VaIcon name="person" size="large" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel class="py-3">{{ user.name }}</VaListItemLabel>
                <VaListItemLabel caption
                  >{{ user._count.teams }} Teams</VaListItemLabel
                >
              </VaListItemSection>
            </VaListItem>
          </VaList>
        </VaCardContent>
      </VaCard>
    </VaInnerLoading>
  </div>
</template>

<style scoped></style>
