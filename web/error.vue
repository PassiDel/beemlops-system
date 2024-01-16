<script setup lang="ts">
import type { FetchError } from 'ofetch';

const router = useRouter();
const localePath = useLocalePath();

const { error } = defineProps<{
  error: FetchError;
}>();

const goBack = () => {
  clearError();
  router.back();
};
const goHome = () => clearError({ redirect: localePath('/') });
</script>

<template>
  <NuxtLayout>
    <div class="grid grid-cols-12 gap-6">
      <VaCard
        class="col-span-12 md:col-span-6 md:col-start-4 xl:col-span-4 xl:col-start-5"
        stripe
        stripe-color="danger"
      >
        <VaCardTitle>{{
          $te(`errors.${error.statusCode}.title`)
            ? $t(`errors.${error.statusCode}.title`)
            : $t('errors.404.title')
        }}</VaCardTitle>
        <VaCardContent class="mb-8">
          <h1 class="va-h1">
            {{
              $te(`errors.${error.statusCode}.title`)
                ? $t(`errors.${error.statusCode}.title`)
                : $t('errors.404.title')
            }}
          </h1>
          <h2 class="text-2xl">
            {{
              $te(`errors.${error.statusCode}.content`)
                ? $t(`errors.${error.statusCode}.content`)
                : $t('errors.404.content')
            }}
          </h2>
        </VaCardContent>
        <VaCardActions align="between">
          <VaButton @click="goBack">{{ $t('errors.go_back') }}</VaButton>
          <VaButton :to="localePath('/')" @click.prevent="goHome">{{
            $t('errors.go_home')
          }}</VaButton></VaCardActions
        ></VaCard
      >
    </div>
  </NuxtLayout>
</template>
