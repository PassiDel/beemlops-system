<script setup lang="ts">
import type { VaSelect } from 'vuestic-ui';
import {
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subHours,
  subMonths,
  subWeeks
} from 'date-fns';

const { t } = useI18n();
const range = ref({
  start: subDays(new Date(), 1),
  end: new Date()
});

const validation = useValidation();
const { pending } = defineProps<{ pending?: boolean }>();

const emit = defineEmits<{
  (e: 'update', range: { start: Date; end: Date }): void;
}>();

const selectOptions = computed(() => [
  {
    text: t('time_window.today'),
    data: () => ({ start: startOfDay(new Date()), end: new Date() })
  },
  {
    text: t('time_window.24h'),
    data: () => ({ start: subHours(new Date(), 24), end: new Date() })
  },
  {
    text: t('time_window.7d'),
    data: () => ({ start: startOfDay(subDays(new Date(), 7)), end: new Date() })
  },
  {
    text: t('time_window.30d'),
    data: () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: new Date()
    })
  },
  {
    text: t('time_window.this_week'),
    data: () => ({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: new Date()
    })
  },
  {
    text: t('time_window.this_month'),
    data: () => ({ start: startOfMonth(new Date()), end: new Date() })
  },
  {
    text: t('time_window.last_week'),
    data: () => ({
      start: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      end: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
    })
  },
  {
    text: t('time_window.last_month'),
    data: () => ({
      start: startOfMonth(subMonths(new Date(), 1)),
      end: endOfMonth(subMonths(new Date(), 1))
    })
  }
]);

const selectRef = ref<typeof VaSelect>();
const select = ref<(typeof selectOptions.value)[0]>();

function selected(value: (typeof selectOptions.value)[0] | undefined) {
  if (!value) {
    return;
  }
  range.value = value.data();
  emit('update', range.value);
}

function rangeInput() {
  selectRef.value?.reset();
  if (validation.dateRangeIsPast()(range.value) !== true) {
    return;
  }
  emit('update', range.value);
}
function refresh() {
  if (!select.value) {
    return;
  }
  range.value = select.value.data();
  emit('update', range.value);
}
emit('update', range.value);
</script>

<template>
  <div class="flex gap-2 flex-wrap">
    <VaDateInput
      v-model="range"
      mode="range"
      close-on-change
      first-weekday="Monday"
      :format-date="$d"
      strict-bind-input-value
      :rules="[validation.dateRangeIsPast()]"
      :loading="pending"
      :disabled="pending"
      @update:model-value="rangeInput"
    />
    <VaSelect
      ref="selectRef"
      v-model="select"
      :options="selectOptions"
      :placeholder="$t('time_window.pick')"
      :is-content-hoverable="false"
      :disabled="pending"
      @update:model-value="selected"
    />
    <VaButton v-if="select" color="success" :loading="pending" @click="refresh"
      ><VaIcon name="refresh"
    /></VaButton>
  </div>
</template>

<style scoped></style>
