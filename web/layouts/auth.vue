<script setup lang="ts">
const route = useRoute();
const localePath = useLocalePath();
</script>

<template>
  <div class="auth-layout grid grid-cols-12 content-center">
    <div class="flex col-span-12 p-4 justify-center">
      <router-link class="py-5 justify-center flex" to="/"> </router-link>
    </div>

    <div class="flex justify-center col-span-12 p-4">
      <va-card class="auth-layout__card">
        <va-card-content>
          <VaButtonGroup grow>
            <VaButton
              :to="localePath('/login')"
              :disabled="route.path === localePath('/login')"
              >{{ $t('login.title') }}</VaButton
            >
            <VaButton
              :to="localePath('/register')"
              :disabled="route.path === localePath('/register')"
              >{{ $t('register.title') }}</VaButton
            >
          </VaButtonGroup>

          <va-separator />

          <div class="p-3">
            <slot />
          </div>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<style scoped></style>
