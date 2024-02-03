<script setup lang="ts">
import { useForm, type VaSelect } from 'vuestic-ui';
import { createSlug } from '~/server/utils/slug';
import useValidation from '~/composables/useValidation';
import type { HiveDevicesDto } from '~/server/dto/hive';

definePageMeta({
  middleware: 'auth',
  title: 'teams.team.locations.location.hive.edit.title'
});
defineI18nRoute({
  paths: {
    en: '/teams/[teamid]/locations/[locationid]/[hiveid]/edit',
    de: '/teams/[teamid]/orte/[locationid]/[hiveid]/bearbeiten'
  }
});

const router = useRouter();
const localePath = useLocalePath();

const validation = useValidation();
const { isValid, resetValidation } = useForm('formRef');
const { isValid: newDeviceValid, resetValidation: newDeviceReset } =
  useForm('newDeviceForm');
const { colors } = useColors();

const { hiveid, teamid, locationid } = useRoute().params;

const {
  error,
  data: _data,
  refresh,
  pending
} = await useFetch(`/api/hives/${hiveid}/devices`);

const hive = _data as Ref<(HiveDevicesDto & { isCreator: boolean }) | null>;
if ((error && error.value) || !hive.value || !hive.value?.isCreator) {
  throw createError(error.value || { statusCode: 403 });
}

const { data: sensorTypes } = await useFetch('/api/sensors');

const form = reactive({
  name: hive.value.name,
  slug: hive.value.slug,
  desc: hive.value.desc,
  rawWeight: hive.value.rawWeight?.toString() || ''
});

const isNew = computed(
  () =>
    form.name !== hive.value?.name ||
    form.slug !== hive.value?.slug ||
    form.desc !== hive.value?.desc ||
    form.rawWeight !== hive.value?.rawWeight?.toString()
);

async function submit() {
  await $fetch(`/api/hives/${hiveid}`, {
    method: 'POST',
    body: form
  });
  resetValidation();
  if (hiveid === form.slug) {
    return;
  }
  await router.push(
    localePath(
      `/teams/${teamid}/locations/${locationid}/${form.slug || hiveid}/edit`
    )
  );
}
const slugError = ref(null as string | null);
async function checkSlug() {
  try {
    await $fetch('/api/hives/check-slug', {
      method: 'POST',
      body: {
        slug: form.slug
      }
    });
    slugError.value = null;
  } catch (e) {
    const code = (e as { statusCode: number })?.statusCode || 400;
    slugError.value = code === 409 ? 'validation.taken' : 'validation.invalid';
  }
}

const newDevice = reactive({
  key: 'secret-key',
  name: 'new Device',
  sensors: [
    {
      name: '',
      key: '',
      sensor: sensorTypes.value?.[0] || {
        id: 2,
        name: 'temp',
        unit: '°C'
      }
    }
  ]
});
async function submitDevice() {
  await $fetch(`/api/hives/${hiveid}/devices`, {
    method: 'POST',
    body: newDevice
  });
  newDeviceReset();
  await refresh();
}

async function deleteDevice(id: number) {
  await $fetch(`/api/devices/${id}`, {
    method: 'DELETE'
  });
  await refresh();
}
async function updateDevice(id: number, key: string, name: string) {
  await $fetch(`/api/devices/${id}`, {
    method: 'PUT',
    body: { key, name }
  });
}
async function updateDeviceSensor(id: number, name: string) {
  await $fetch(`/api/devicesensors/${id}`, {
    method: 'PUT',
    body: { name }
  });
}
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <VaCard
      class="col-span-12 lg:col-span-6 xl:col-span-4 xl:col-start-3 h-fit"
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
            type="text"
            :label="$t('teams.team.locations.location.hive.name')"
            :placeholder="$t('teams.team.locations.location.hive.name')"
            counter
            :max-length="64"
            required-mark
            :rules="[
              validation.required(
                $t('teams.team.locations.location.hive.name')
              ),
              validation.max($t('teams.team.locations.location.hive.name'), 64)
            ]"
            required
            @change="form.slug = createSlug(form.name)"
          >
            <template #prependInner>
              <VaIcon name="badge" color="secondary" />
            </template>
          </VaInput>
          <VaTextarea
            v-model="form.desc"
            :label="$t('teams.team.locations.location.hive.desc')"
            :placeholder="$t('teams.team.locations.location.hive.desc')"
            autosize
            :max-rows="10"
            required-mark
            counter
            :max-length="4069"
            :rules="[
              validation.required(
                $t('teams.team.locations.location.hive.desc')
              ),
              validation.max(
                $t('teams.team.locations.location.hive.desc'),
                4069
              )
            ]"
            required
          />
          <VaInput
            v-model="form.slug"
            type="text"
            :label="$t('teams.team.locations.location.hive.slug')"
            :placeholder="$t('teams.team.locations.location.hive.slug')"
            counter
            :max-length="64"
            required-mark
            :error-messages="slugError ? $t(slugError) : []"
            :error="!!slugError"
            :rules="[
              validation.required(
                $t('teams.team.locations.location.hive.slug')
              ),
              validation.max($t('teams.team.locations.location.hive.slug'), 64),
              validation.min($t('teams.team.locations.location.hive.slug'), 7)
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
                <VaIcon name="refresh" color="primary" />
              </VaButton>
            </template>
          </VaInput>
          <VaInput
            v-model="form.rawWeight"
            type="text"
            inputmode="decimal"
            clearable
            :label="$t('teams.team.locations.location.hive.raw_weight')"
            :rules="[
              validation.numericOptional(
                $t('teams.team.locations.location.hive.raw_weight')
              )
            ]"
          >
            <template #prependInner>
              <VaIcon name="scale" color="secondary" />
            </template>
          </VaInput>

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
      <VaCardTitle>{{
        $t('teams.team.locations.location.hive.devices')
      }}</VaCardTitle>
      <VaCardContent>
        <VaAccordion v-if="!pending">
          <VaCollapse
            v-for="device in hive?.devices"
            :key="`d-${device.id}`"
            :header="device.name || device.id.toString()"
          >
            <template #content>
              <VaValue v-slot="errors">
                <div class="flex flex-col gap-4">
                  <VaValue v-slot="isPasswordVisible" :default-value="false">
                    <VaInput
                      v-model="device.key"
                      :type="isPasswordVisible.value ? 'text' : 'password'"
                      placeholder="my-secret-key"
                      :label="
                        $t('teams.team.locations.location.hive.device.key')
                      "
                      counter
                      :max-length="64"
                      required-mark
                      :rules="[
                        validation.required(
                          $t('teams.team.locations.location.hive.device.key')
                        ),
                        validation.max(
                          $t('teams.team.locations.location.hive.device.key'),
                          64
                        )
                      ]"
                      required
                      @update:error="(e) => (errors.value = e)"
                    >
                      <template #prependInner>
                        <VaIcon name="key" color="secondary" />
                      </template>

                      <template #appendInner>
                        <VaButton
                          preset="plain"
                          :title="
                            $t(
                              isPasswordVisible.value
                                ? 'auth.hidePassword'
                                : 'auth.showPassword'
                            )
                          "
                          @click="
                            isPasswordVisible.value = !isPasswordVisible.value
                          "
                        >
                          <VaIcon
                            :name="
                              isPasswordVisible.value
                                ? 'visibility_off'
                                : 'visibility'
                            "
                            color="primary"
                          />
                        </VaButton>
                      </template>
                    </VaInput>
                  </VaValue>
                  <VaInput
                    v-model="device.name"
                    type="text"
                    :label="
                      $t('teams.team.locations.location.hive.device.name')
                    "
                    counter
                    :max-length="64"
                    required-mark
                    :rules="[
                      validation.required(
                        $t('teams.team.locations.location.hive.device.name')
                      ),
                      validation.max(
                        $t('teams.team.locations.location.hive.device.name'),
                        64
                      )
                    ]"
                    required
                    @update:error="(e) => (errors.value = e)"
                  />
                </div>

                <VaButtonGroup class="mt-4">
                  <VaButton color="danger" @click="deleteDevice(device.id)">{{
                    $t('delete')
                  }}</VaButton>
                  <VaButton
                    color="success"
                    :disabled="errors.value"
                    @click="updateDevice(device.id, device.key, device.name)"
                    >{{ $t('save') }}</VaButton
                  >
                </VaButtonGroup>
              </VaValue>
              <h2 class="text-2xl my-8">
                {{ $t('teams.team.locations.location.hive.device.sensors') }}
              </h2>
              <div class="flex flex-col gap-8 w-full">
                <div
                  v-for="sensor in device.sensors"
                  :key="`s-${sensor.id}`"
                  class="flex flex-col gap-2 p-4 rounded-xl"
                  :style="{ backgroundColor: colors.backgroundElement }"
                >
                  <VaValue v-slot="edit">
                    <VaInput
                      v-if="edit.value"
                      v-model="sensor.name"
                      :label="
                        $t(
                          'teams.team.locations.location.hive.device.device_sensor.name'
                        )
                      "
                      counter
                      :max-length="64"
                      required-mark
                      :rules="[
                        validation.required(
                          $t(
                            'teams.team.locations.location.hive.device.device_sensor.name'
                          )
                        ),
                        validation.max(
                          $t(
                            'teams.team.locations.location.hive.device.device_sensor.name'
                          ),
                          64
                        )
                      ]"
                      required
                      @blur="
                        updateDeviceSensor(sensor.id, sensor.name);
                        edit.value = false;
                      "
                      @keyup.enter="
                        updateDeviceSensor(sensor.id, sensor.name);
                        edit.value = false;
                      "
                    >
                      <template #append>
                        <VaButton
                          icon="save"
                          class="ml-4"
                          color="success"
                          @click="
                            updateDeviceSensor(sensor.id, sensor.name);
                            edit.value = !edit.value;
                          "
                      /></template>
                    </VaInput>
                    <h3
                      v-else
                      class="text-xl"
                      :style="{ color: colors.primary }"
                    >
                      {{ sensor.name }}
                      <VaButton
                        class="ml-4"
                        icon="edit"
                        color="warning"
                        @click="edit.value = !edit.value"
                      />
                    </h3>
                  </VaValue>
                  <div
                    class="flex flex-col gap-2"
                    :style="{ color: colors.textPrimary }"
                  >
                    <!--suppress AllyHtmlVueInspection -->
                    <p>
                      {{
                        // noinspection TypeScriptValidateTypes
                        $t(
                          'teams.team.locations.location.hive.device.device_sensor.key_show',
                          { key: sensor.key }
                        )
                      }}
                    </p>
                    <!--suppress AllyHtmlVueInspection -->
                    <p>
                      {{
                        // noinspection TypeScriptValidateTypes
                        $t(
                          'teams.team.locations.location.hive.device.device_sensor.sensor.type',
                          {
                            sensor: $t(`units.${sensor.sensor.name}`),
                            unit: sensor.sensor.unit
                          }
                        )
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </VaCollapse>
          <VaCollapse
            :header="$t('teams.team.locations.location.hive.device.new')"
            icon="add"
            color="success"
            ><template #content>
              <VaForm
                ref="newDeviceForm"
                tag="form"
                @submit.prevent="submitDevice"
                ><div class="flex flex-col gap-4">
                  <VaValue v-slot="isPasswordVisible" :default-value="false">
                    <VaInput
                      v-model="newDevice.key"
                      :type="isPasswordVisible.value ? 'text' : 'password'"
                      placeholder="my-secret-key"
                      :label="
                        $t('teams.team.locations.location.hive.device.key')
                      "
                      counter
                      :max-length="64"
                      required-mark
                      :rules="[
                        validation.required(
                          $t('teams.team.locations.location.hive.device.key')
                        ),
                        validation.max(
                          $t('teams.team.locations.location.hive.device.key'),
                          64
                        )
                      ]"
                      required
                      ><template #prependInner>
                        <VaIcon name="key" color="secondary" />
                      </template>

                      <template #appendInner>
                        <VaButton
                          preset="plain"
                          :title="
                            $t(
                              isPasswordVisible.value
                                ? 'auth.hidePassword'
                                : 'auth.showPassword'
                            )
                          "
                          @click="
                            isPasswordVisible.value = !isPasswordVisible.value
                          "
                        >
                          <VaIcon
                            :name="
                              isPasswordVisible.value
                                ? 'visibility_off'
                                : 'visibility'
                            "
                            color="primary"
                          />
                        </VaButton> </template></VaInput
                  ></VaValue>
                  <VaInput
                    v-model="newDevice.name"
                    type="text"
                    :label="
                      $t('teams.team.locations.location.hive.device.name')
                    "
                    counter
                    :max-length="64"
                    required-mark
                    :rules="[
                      validation.required(
                        $t('teams.team.locations.location.hive.device.name')
                      ),
                      validation.max(
                        $t('teams.team.locations.location.hive.device.name'),
                        64
                      )
                    ]"
                    :error="newDevice.sensors.length <= 0"
                    required
                  />
                </div>
                <h2 class="text-2xl my-8">
                  {{ $t('teams.team.locations.location.hive.device.sensors') }}
                  <VaButton
                    icon="add"
                    class="ml-4"
                    color="success"
                    @click="
                      newDevice.sensors.push({
                        name: '',
                        key: '',
                        sensor: sensorTypes?.[0] || {
                          id: 2,
                          name: 'temp',
                          unit: '°C'
                        }
                      })
                    "
                  />
                </h2>
                <!--suppress AllyHtmlVueInspection -->
                <span
                  v-if="newDevice.sensors.length <= 0"
                  :style="{ color: colors.danger }"
                  >{{
                    // noinspection TypeScriptValidateTypes
                    $t('validation.min_array', {
                      min: '1',
                      name: $t(
                        'teams.team.locations.location.hive.device.device_sensor.sensor_type'
                      )
                    })
                  }}</span
                >
                <div class="flex flex-col gap-8 w-full">
                  <div
                    v-for="(sensor, i) in newDevice.sensors"
                    :key="`ns-${i}`"
                    class="flex flex-col gap-2 p-4 rounded-xl"
                    :style="{ backgroundColor: colors.backgroundElement }"
                  >
                    <!--suppress AllyHtmlVueInspection -->
                    <h3 class="text-xl">
                      {{
                        // noinspection TypeScriptValidateTypes
                        $t(
                          'teams.team.locations.location.hive.device.device_sensor.name_key',
                          sensor
                        )
                      }}
                      <VaButton
                        class="float-right"
                        icon="delete"
                        color="danger"
                        @click="newDevice.sensors.splice(i, 1)"
                      />
                    </h3>

                    <div
                      class="flex flex-col gap-2"
                      :style="{ color: colors.textPrimary }"
                    >
                      <VaInput
                        v-model="sensor.name"
                        :label="
                          $t(
                            'teams.team.locations.location.hive.device.device_sensor.name'
                          )
                        "
                        counter
                        :max-length="64"
                        required-mark
                        :rules="[
                          validation.required(
                            $t(
                              'teams.team.locations.location.hive.device.device_sensor.name'
                            )
                          ),
                          validation.max(
                            $t(
                              'teams.team.locations.location.hive.device.device_sensor.name'
                            ),
                            64
                          )
                        ]"
                        required
                      />
                      <VaInput
                        v-model="sensor.key"
                        :label="
                          $t(
                            'teams.team.locations.location.hive.device.device_sensor.key'
                          )
                        "
                        counter
                        :max-length="64"
                        required-mark
                        :rules="[
                          validation.required(
                            $t(
                              'teams.team.locations.location.hive.device.device_sensor.key'
                            )
                          ),
                          validation.max(
                            $t(
                              'teams.team.locations.location.hive.device.device_sensor.key'
                            ),
                            64
                          ),
                          (value) =>
                            newDevice.sensors.every(
                              (s, si) => s.key !== value || si === i
                            ) ||
                            $t(
                              'teams.team.locations.location.hive.device.device_sensor.unique_key'
                            )
                        ]"
                        required
                      />
                      <VaSelect
                        v-model="sensor.sensor"
                        :label="
                          $t(
                            'teams.team.locations.location.hive.device.device_sensor.sensor_type'
                          )
                        "
                        :options="sensorTypes"
                        :is-content-hoverable="false"
                        track-by="id"
                        :text-by="
                          (o) =>
                            $t('unit_name_with_unit', {
                              name: $t(`units.${o.name}`),
                              unit: o.unit
                            })
                        "
                      />
                    </div>
                  </div>
                </div>
                <VaButton
                  class="mt-8"
                  color="success"
                  type="submit"
                  :disabled="!newDeviceValid"
                  >{{ $t('save') }}</VaButton
                >
              </VaForm>
            </template>
          </VaCollapse>
        </VaAccordion>
      </VaCardContent></VaCard
    >
  </div>
</template>

<style scoped></style>
