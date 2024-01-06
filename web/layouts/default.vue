<script setup lang="ts">
const breakpoints = useBreakpoint();

const isSidebarVisible = ref(breakpoints.mdUp);

watchEffect(() => {
  isSidebarVisible.value = breakpoints.smUp;
});

const menu: {
  icon: string;
  title: string;
  to: string;
  show?: (l: boolean) => boolean;
}[] = [
  { icon: 'house', title: 'Home', to: '/' },
  { icon: 'info', title: 'About', to: '/about' },
  { icon: 'group', title: 'Users', to: '/users' },
  { icon: 'save', title: 'Cache', to: '/cache' },
  { icon: 'login', title: 'Login', to: '/login', show: (l) => !l },
  {
    icon: 'app_registration',
    title: 'Register',
    to: '/register',
    show: (l) => !l
  }
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

const { loggedIn, clear } = useUserSession();
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
          v-for="{ icon, title, to } in menu.filter((m) =>
            m.show ? m.show(loggedIn) : true
          )"
          :key="to"
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
          <BreadCrumbs class="mb-4" />
          <slot />
        </article>
      </main>
    </template>
  </VaLayout>
</template>

<style scoped></style>
