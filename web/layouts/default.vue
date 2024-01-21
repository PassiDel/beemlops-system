<script setup lang="ts">
const breakpoints = useBreakpoint();

const isSidebarVisible = ref(breakpoints.mdUp);

watchEffect(() => {
  isSidebarVisible.value = breakpoints.smUp;
});

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

const menu = computed(() => {
  const routes = [
    { icon: 'house', title: 'menu.home', to: '/' },
    {
      icon: 'dashboard',
      title: 'menu.dashboard',
      to: '/dashboard',
      show: toRef(loggedIn).value
    },
    {
      icon: 'account_circle',
      title: 'menu.settings',
      to: '/profile',
      show: toRef(loggedIn).value
    },
    {
      icon: 'login',
      title: 'menu.login',
      to: '/login',
      show: !toRef(loggedIn).value
    },
    {
      icon: 'app_registration',
      title: 'menu.register',
      to: '/register',
      show: !toRef(loggedIn).value
    },
    {
      icon: 'groups',
      title: 'menu.teams',
      to: '/teams',
      show: toRef(loggedIn).value
    },
    {
      icon: 'group',
      title: 'menu.team',
      to: `/teams/${route.params.teamid}`,
      show: toRef(loggedIn).value && route.params.teamid !== undefined
    },
    {
      icon: 'location_on',
      title: 'menu.locations',
      to: `/teams/${route.params.teamid}/locations`,
      show: toRef(loggedIn).value && route.params.teamid !== undefined
    },
    {
      icon: 'list',
      title: 'menu.hives',
      to: `/teams/${route.params.teamid}/locations/${route.params.locationid}`,
      show:
        toRef(loggedIn).value &&
        route.params.teamid !== undefined &&
        route.params.locationid !== undefined
    },
    {
      icon: 'hive',
      title: 'menu.hive',
      to: `/teams/${route.params.teamid}/locations/${route.params.locationid}/${route.params.hiveid}`,
      show:
        toRef(loggedIn).value &&
        route.params.teamid !== undefined &&
        route.params.locationid !== undefined &&
        route.params.hiveid !== undefined
    },
    {
      icon: 'assignment',
      title: 'menu.inspections',
      to: `/teams/${route.params.teamid}/locations/${route.params.locationid}/${route.params.hiveid}/inspections`,
      show:
        toRef(loggedIn).value &&
        route.params.teamid !== undefined &&
        route.params.locationid !== undefined &&
        route.params.hiveid !== undefined
    },
    {
      icon: 'assignment_add',
      title: 'menu.new_inspection',
      to: `/teams/${route.params.teamid}/locations/${route.params.locationid}/${route.params.hiveid}/inspections/create`,
      show:
        toRef(loggedIn).value &&
        route.params.teamid !== undefined &&
        route.params.locationid !== undefined &&
        route.params.hiveid !== undefined
    }
  ];

  console.log(route.params);

  return routes.filter((r) => r.show === true || r.show === undefined);
});
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
          :key="to"
          :to="localePath(to)"
          :active="localePath(to) === route.path"
        >
          <VaSidebarItemContent>
            <VaIcon :name="icon" />
            <!--suppress AllyHtmlVueInspection -->
            <VaSidebarItemTitle>
              {{ $te(title) ? $t(title) : title }}
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
