-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "kaizoo" TEXT,
ADD COLUMN     "profileReady" BOOLEAN NOT NULL DEFAULT false;
