<script setup lang="ts">
import { useForm } from 'vuestic-ui';
import type {
  LatLngLiteral,
  LeafletMouseEvent,
  Map as LeafletMap,
  PointExpression
} from 'leaflet';
import { createSlug } from '~/server/utils/slug';

definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.location.edit.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations/[locationid]/edit',
    de: '/teams/[teamid]/orte/[locationid]/bearbeiten'
  }
});

const centerOfGermany = [51.4266144, 10.3711502] as [number, number];

const { isValid, resetValidation } = useForm('formRef');
const validation = useValidation();
const router = useRouter();
const localePath = useLocalePath();

const { locationid, teamid } = useRoute().params;

const { error, data } = await useFetch(`/api/locations/${locationid}`);
if ((error && error.value) || !data.value) {
  throw createError(error.value || '');
}

const form = reactive({
  name: data.value.name,
  slug: data.value.slug
});

const latLon = ref<LatLngLiteral>({
  lat:
    data.value.lat !== null ? parseFloat(data.value.lat) : centerOfGermany[0],
  lng: data.value.lon !== null ? parseFloat(data.value.lon) : centerOfGermany[1]
});

const isNew = computed(
  () =>
    form.name !== data.value?.name ||
    form.slug !== data.value?.slug ||
    (latLon.value.lat !== data.value?.lat &&
      latLon.value.lat !== centerOfGermany[0]) ||
    (latLon.value.lng !== data.value?.lon &&
      latLon.value.lng !== centerOfGermany[1])
);

async function submit() {
  const { lat, lng } = latLon.value;
  await $fetch(`/api/locations/${locationid}`, {
    method: 'POST',
    body: {
      ...form,
      lat: lat === centerOfGermany[0] ? null : lat,
      lon: lng === centerOfGermany[1] ? null : lng
    }
  });
  resetValidation();
  await router.push(
    localePath(`/teams/${teamid}/locations/${form.slug || locationid}`)
  );
}

const slugError = ref(null as string | null);
async function checkSlug() {
  try {
    await $fetch('/api/locations/check-slug', {
      method: 'POST',
      body: {
        slug: form.slug,
        id: data.value?.locationid
      }
    });
    slugError.value = null;
  } catch (e) {
    const code = (e as { statusCode: number })?.statusCode || 400;
    slugError.value = code === 409 ? 'validation.taken' : 'validation.invalid';
  }
}
const center = ref<PointExpression>(
  latLon.value.lat !== 0 && latLon.value.lng !== 0
    ? [latLon.value.lat, latLon.value.lng]
    : centerOfGermany
);
const zoom = ref(6);

function ready(map: LeafletMap) {
  map.addEventListener('click', (e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    latLon.value = { lat: lat % 90, lng: lng % 180 };
  });
}
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-4"
      stripe
      stripe-color="success"
    >
      <VaCardContent>
        <VaForm
          ref="formRef"
          tag="form"
          class="flex flex-col items-baseline gap-6"
          @submit.prevent="submit"
        >
          <VaInput
            v-model="form.name"
            :label="$t('teams.team.locations.location.name')"
            :placeholder="$t('teams.team.locations.location.name')"
            required-mark
            counter
            :max-length="64"
            :rules="[
              validation.required($t('teams.team.locations.location.name')),
              validation.max($t('teams.team.locations.location.name'), 64)
            ]"
            required
            @change="form.slug = createSlug(form.name)"
          >
            <template #prependInner>
              <VaIcon name="group" color="secondary" />
            </template>
          </VaInput>
          <VaInput
            v-model="form.slug"
            type="text"
            :label="$t('teams.team.locations.location.slug')"
            :placeholder="$t('teams.team.locations.location.slug')"
            counter
            :max-length="64"
            required-mark
            :error-messages="slugError ? $t(slugError) : []"
            :error="!!slugError"
            :rules="[
              validation.required($t('teams.team.locations.location.slug')),
              validation.max($t('teams.team.locations.location.slug'), 64),
              validation.min($t('teams.team.locations.location.slug'), 7)
            ]"
            required
            @change="checkSlug"
          >
            <template #prependInner>
              <VaIcon name="link" color="secondary" />
            </template>
            <template #appendInner>
              <VaButton
                :disabled="!form.name"
                preset="plain"
                :title="$t('regenerate')"
                @click="
                  form.slug = createSlug(form.name);
                  checkSlug();
                "
              >
                <VaIcon name="refresh" color="primary" /> </VaButton
            ></template>
          </VaInput>
          <div
            v-if="
              latLon.lat === centerOfGermany[0] ||
              latLon.lng === centerOfGermany[1]
            "
          >
            <p>{{ $t('teams.team.locations.location.no_lat') }}</p>
            <p>{{ $t('teams.team.locations.location.no_lng') }}</p>
          </div>
          <div v-else>
            <p>
              {{
                $t('teams.team.locations.location.lat', {
                  lat: latLon.lat.toFixed(4)
                })
              }}
            </p>
            <p>
              {{
                $t('teams.team.locations.location.lng', {
                  lng: latLon.lng.toFixed(4)
                })
              }}
            </p>
          </div>
          <VaButton type="submit" :disabled="!isValid || !isNew">{{
            $t('save')
          }}</VaButton>
        </VaForm>
      </VaCardContent></VaCard
    >
    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-4"
      stripe
      stripe-color="success"
    >
      <VaCardContent>
        <div class="w-full h-[400px]">
          <LMap
            ref="map"
            v-model:zoom="zoom"
            v-model:center="center"
            :max-bounds-viscosity="1"
            @ready="ready"
          >
            <LTileLayer
              no-wrap
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              layer-type="base"
              name="OpenStreetMap"
            />
            <LMarker v-model:lat-lng="latLon" draggable />
          </LMap>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped></style>
