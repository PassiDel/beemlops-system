<script setup lang="ts">
const router = useRouter();

const i18n = useI18n();

const crumbs = computed(() => {
  const route = router.currentRoute.value;

  return route.path.split('/').reduce(
    (acc, curr, id) => {
      if (id > 0 && !curr) {
        return acc;
      }
      acc.path += acc.path.length > 1 ? `/${curr}` : curr;
      if (id === 0 && i18n.locale.value !== i18n.defaultLocale) {
        // Filter /{lang} path
        return acc;
      }
      const route = router.resolve(acc.path);
      if (route && route.meta?.title) {
        acc.crumbs.push({
          path: acc.path,
          name: route.meta.title as string,
          route
        });
      }
      return acc;
    },
    { path: '/', crumbs: [] as { path: string; name: string; route: any }[] }
  ).crumbs;
});
</script>

<template>
  <VaBreadcrumbs color="primary">
    <VaBreadcrumbsItem
      v-for="{ path, name } in crumbs"
      :key="path"
      :to="path"
      :label="$t(name)"
    />
  </VaBreadcrumbs>
</template>

<style scoped></style>
