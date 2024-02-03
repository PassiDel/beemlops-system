<script setup lang="ts">
const { colors } = useColors();
const { locale } = useI18n();
const props = defineProps<{
  total?: {
    total: number;
    last24: number;
    last: string | Date | null;
  };
  pending?: boolean;
}>();
</script>

<template>
  <va-card class="col-span-12 lg:col-span-6 h-fit">
    <va-card-title>{{ $t('dashboard.total.measurements') }}</va-card-title>
    <va-card-content
      v-if="!props.pending && props.total"
      class="grid grid-cols-6 md:grid-cols-12 row-separated"
    >
      <div class="col-span-3 p-4 flex flex-col">
        <h2 class="va-h2 m-0 va-text-center" :style="{ color: colors.primary }">
          {{ props.total.total }}
        </h2>
        <p class="va-text-center">{{ $t('dashboard.total.total') }}</p>
      </div>
      <div class="col-span-3 p-4 flex flex-col">
        <h2 class="va-h2 m-0 va-text-center" :style="{ color: colors.info }">
          {{ props.total.last24 }}
        </h2>
        <p class="va-text-center no-wrap">{{ $t('dashboard.total.last24') }}</p>
      </div>
      <div class="col-span-6 p-4 flex flex-col">
        <!--suppress AllyHtmlVueInspection -->
        <h2 class="va-h2 m-0 va-text-center" :style="{ color: colors.warning }">
          {{
            // noinspection TypeScriptValidateTypes
            props.total.last
              ? new Intl.DateTimeFormat(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'medium'
                }).format(new Date(props.total.last))
              : 'No data'
          }}
        </h2>
        <p class="va-text-center">{{ $t('dashboard.total.last') }}</p>
      </div>
    </va-card-content>
    <va-card-content v-else>
      <VaSkeletonGroup
        class="grid grid-cols-6 md:grid-cols-12 row-separated"
        :delay="0"
      >
        <div class="col-span-3 p-4 flex flex-col">
          <VaSkeleton tag="h2" />
          <p class="va-text-center">{{ $t('dashboard.total.total') }}</p>
        </div>
        <div class="col-span-3 p-4 flex flex-col">
          <VaSkeleton tag="h2" />
          <p class="va-text-center no-wrap">
            {{ $t('dashboard.total.last24') }}
          </p>
        </div>
        <div class="col-span-6 p-4 flex flex-col">
          <VaSkeleton tag="h2" />
          <p class="va-text-center">{{ $t('dashboard.total.last') }}</p>
        </div>
      </VaSkeletonGroup>
    </va-card-content>
  </va-card>
</template>

<style scoped></style>
