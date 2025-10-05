/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ActivityKey" AS ENUM ('alongamento', 'caminhada', 'corrida', 'pedalada', 'yoga', 'outro');

-- CreateEnum
CREATE TYPE "public"."Intensity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "public"."Environment" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "public"."ChallengeStatus" AS ENUM ('active', 'completed');

-- CreateEnum
CREATE TYPE "public"."SourceKind" AS ENUM ('available', 'event');

-- DropIndex
DROP INDEX "public"."RefreshToken_userId_idx";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "password",
DROP COLUMN "updatedAt",
ADD COLUMN     "mascot" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."ActivityKey" NOT NULL,
    "dateIso" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "distanceKm" DECIMAL(10,2),
    "intensity" "public"."Intensity" NOT NULL,
    "mood" INTEGER,
    "environment" "public"."Environment",
    "notes" TEXT,
    "calories" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceKind" "public"."SourceKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rewardXp" INTEGER NOT NULL,
    "status" "public"."ChallengeStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationDays" INTEGER,
    "expiresInDays" INTEGER,
    "metricType" "public"."ActivityKey",
    "metricDurationMin" INTEGER,
    "metricDistanceKm" DECIMAL(10,2),
    "metricIntensity" "public"."Intensity",
    "metricCalories" INTEGER,
    "eventTitle" TEXT,
    "eventDate" TEXT,
    "eventLocation" TEXT,
    "instanceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_dateIso_idx" ON "public"."Activity"("userId", "dateIso");

-- CreateIndex
CREATE INDEX "UserChallenge_userId_status_createdAt_idx" ON "public"."UserChallenge"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_revoked_expiresAt_idx" ON "public"."RefreshToken"("userId", "revoked", "expiresAt");

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserChallenge" ADD CONSTRAINT "UserChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
