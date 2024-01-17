/*
  Warnings:

  - The primary key for the `DeviceSensor` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "key" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DeviceSensor" DROP CONSTRAINT "DeviceSensor_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "DeviceSensor_pkey" PRIMARY KEY ("id");
