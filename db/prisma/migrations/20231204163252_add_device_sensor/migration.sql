-- DropIndex
DROP INDEX "Device_hiveId_key";

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "key" TEXT NOT NULL default '';

-- CreateTable
CREATE TABLE "DeviceSensor" (
    "deviceId" INTEGER NOT NULL,
    "sensorId" INTEGER NOT NULL,
    "key" TEXT,

    CONSTRAINT "DeviceSensor_pkey" PRIMARY KEY ("deviceId","sensorId")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceSensor" ADD CONSTRAINT "DeviceSensor_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSensor" ADD CONSTRAINT "DeviceSensor_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
