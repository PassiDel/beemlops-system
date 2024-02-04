import { Device, DeviceSensor, Hive, HiveLocation, Sensor } from '@mono/db';

export type FullHiveLocation = HiveLocation & { hives: Hive[] };
export type DeviceWithSensor = Device & {
  DeviceSensor: (DeviceSensor & { sensor: Sensor })[];
};
export type HiveDevices = Hive & {
  device: DeviceWithSensor[];
};
export function locationDto(location: HiveLocation) {
  const { id, name, slug, lat, lon, createdAt } = location;

  return { id, name, slug, lat, lon, createdAt };
}

export type LocationDto = ReturnType<typeof locationDto>;

export function locationHiveDto(location: FullHiveLocation) {
  return { ...locationDto(location), hives: location.hives.map(hiveDto) };
}

export type LocationHiveDto = ReturnType<typeof locationHiveDto>;

export function hiveDto(hive: Hive) {
  const { id, name, slug, desc, rawWeight, createdAt } = hive;

  return { id, name, slug, desc, rawWeight, createdAt };
}

export type HiveDto = ReturnType<typeof hiveDto>;

export function hiveDevicesDto(hive: HiveDevices) {
  const dto = hiveDto(hive);

  return { ...dto, devices: hive.device.map(deviceDto) };
}

export type HiveDevicesDto = ReturnType<typeof hiveDevicesDto>;

export function deviceSensorDto(
  deviceSensor: DeviceWithSensor['DeviceSensor'][0]
) {
  const { id, sensor, name, key } = deviceSensor;

  const { name: sensorName, unit, id: sensorId } = sensor;
  return { id, key, name, sensor: { name: sensorName, unit, id: sensorId } };
}
export type DeviceSensorDto = ReturnType<typeof deviceSensorDto>;
export function deviceDto(device: DeviceWithSensor) {
  const { id, DeviceSensor, key, createdAt, name } = device;

  return {
    id,
    key,
    name,
    createdAt,
    sensors: DeviceSensor.map(deviceSensorDto)
  };
}
export type DeviceDto = ReturnType<typeof deviceDto>;
