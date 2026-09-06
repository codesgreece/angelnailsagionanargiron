-- AlterTable
ALTER TABLE "PromoPopupSettings" ALTER COLUMN "delayMs" SET DEFAULT 6000;

-- Update existing default campaign delay to 6 seconds
UPDATE "PromoPopupSettings" SET "delayMs" = 6000 WHERE "id" = 'default';
