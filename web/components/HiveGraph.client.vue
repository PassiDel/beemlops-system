<script setup lang="ts">
import 'chartjs-adapter-date-fns';
import { de, enUS } from 'date-fns/locale';
import { Line } from 'vue-chartjs';
import {
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip
} from 'chart.js';

import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  Title,
  PointElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Colors,
  zoomPlugin
);
const { locale } = useI18n();

const props = defineProps<{
  sensor: {
    id: number;
    name: string;
    unit: string;
    devices: {
      key: string | null;
      name: string | null;
      id: number;
      deviceId: number;
    }[];
  };
  data:
    | {
        id: number;
        keys: { key: string; data: { x: string; y: number }[] }[];
      }[]
    | null;
}>();

const datasets = computed(() => ({
  datasets: props.sensor.devices.map((de) => ({
    label: de.name || de.key || '',
    data:
      props.data
        ?.find((d) => d.id === de.deviceId)
        ?.keys?.find((k) => k.key === de.key)?.data || [],
    fill: false,
    tension: 0.1
  }))
}));
</script>

<template>
  <Line
    v-if="data"
    :options="{
      responsive: true,
      locale,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.parsed.y} ${props.sensor.unit}`
          }
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true
            },
            pinch: {
              enabled: true
            },
            mode: 'xy'
          },
          pan: {
            enabled: true
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          },
          adapters: {
            date: {
              locale: locale === 'de' ? de : enUS
            }
          }
        },
        y: {
          title: {
            display: true,
            text: props.sensor.unit
          }
        }
      }
    }"
    :data="datasets as any"
  />
  <VaSkeleton v-else variant="squared" height="12rem" animation="wave" />
</template>

<style scoped></style>
