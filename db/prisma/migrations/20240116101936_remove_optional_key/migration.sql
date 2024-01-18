/*
  Warnings:

  - Made the column `key` on table `DeviceSensor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DeviceSensor" ALTER COLUMN "key" SET NOT NULL;

INSERT INTO "Sensor" (name, unit) VALUES ('temp', '°F');
INSERT INTO "Sensor" (name, unit) VALUES ('temp', '°C');
INSERT INTO "Sensor" (name, unit) VALUES ('pressure', 'hPa');
INSERT INTO "Sensor" (name, unit) VALUES ('weight', 'kg');
INSERT INTO "Sensor" (name, unit) VALUES ('humidity', '%');
INSERT INTO "Sensor" (name, unit) VALUES ('rssi', 'dBm');