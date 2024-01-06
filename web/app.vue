<script setup lang="ts">
const route = useRoute();
const { t } = useI18n();
const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true
});
const title = computed(() =>
  t('layouts.title', { title: t(route.meta.title ?? 'default.title') })
);
</script>
<template>
  <Html
    :lang="head?.htmlAttrs?.lang?.split('-')[0]"
    :dir="head?.htmlAttrs?.dir"
  >
    <Head>
      <Title>{{ title }}</Title>
      <template v-for="link in head.link" :key="link.id">
        <Link
          :id="link.id"
          :rel="link.rel"
          :href="link.href"
          :hreflang="link.hreflang"
        />
      </template>
      <template v-for="meta in head.meta" :key="meta.id">
        <Meta :id="meta.id" :property="meta.property" :content="meta.content" />
      </template>
    </Head>
    <Body>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<style>
/*noinspection ALL*/
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
/*noinspection ALL*/
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
