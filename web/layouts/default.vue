<script setup lang="ts">
const breakpoints = useBreakpoint();

const isSidebarVisible = ref(breakpoints.mdUp);

watchEffect(() => {
  isSidebarVisible.value = breakpoints.smUp;
});

const menu = [
  { icon: 'info', title: 'About', to: '/about' },
  { icon: 'group', title: 'Users', to: '/users' },
  { icon: 'save', title: 'Cache', to: '/cache' },
  { icon: 'login', title: 'Login', to: '/login' },
  { icon: 'app_registration', title: 'Register', to: '/register' }
];
const { applyPreset, currentPresetName } = useColors();

const switchValue = computed({
  get() {
    return currentPresetName.value;
  },
  set(value) {
    applyPreset(value);
  }
});

const route = useRoute();
const localePath = useLocalePath();

const { loggedIn, user, clear } = useUserSession();
</script>

<template>
  <VaLayout
    :top="{ fixed: true, order: 2 }"
    :left="{
      fixed: true,
      absolute: breakpoints.smDown,
      order: 1,
      overlay: breakpoints.smDown && isSidebarVisible
    }"
    @left-overlay-click="isSidebarVisible = false"
  >
    <template #top>
      <VaNavbar shadowed>
        <template #left>
          <VaButton
            preset="secondary"
            :icon="isSidebarVisible ? 'menu_open' : 'menu'"
            @click="isSidebarVisible = !isSidebarVisible"
          />
        </template>
      </VaNavbar>
    </template>

    <template #left>
      <VaSidebar v-model="isSidebarVisible">
        <VaSidebarItem
          v-for="{ icon, title, to } in menu"
          :key="icon"
          :to="localePath(to)"
          :active="localePath(to) === route.path"
        >
          <VaSidebarItemContent>
            <VaIcon :name="icon" />
            <VaSidebarItemTitle>
              {{ title }}
            </VaSidebarItemTitle>
          </VaSidebarItemContent>
        </VaSidebarItem>
        <VaSpacer />
        <VaSidebarItem v-if="loggedIn" @click="clear">
          <VaSidebarItemContent>
            <VaIcon name="logout" />
            <VaSidebarItemTitle>
              {{ $t('auth.logout') }}
            </VaSidebarItemTitle>
          </VaSidebarItemContent>
        </VaSidebarItem>
        <VaSidebarItem>
          <VaSidebarItemContent>
            <VaSwitch
              v-model="switchValue"
              :label="$t('dark_mode')"
              left-label
              true-value="dark"
              false-value="light"
              size="small"
            />
          </VaSidebarItemContent>
        </VaSidebarItem>
        <LangSwitcher />
      </VaSidebar>
    </template>

    <template #content>
      <main>
        <article class="p-4">
          <h1 class="text-3xl font-bold text-success underline mb-4">
            {{ $t('welcome') }} {{ loggedIn ? user.name : '' }}
          </h1>
          <slot />
        </article>
      </main>
    </template>
  </VaLayout>
</template>

<style scoped></style>
