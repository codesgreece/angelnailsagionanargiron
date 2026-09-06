-- CreateTable
CREATE TABLE "PromoPopupSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'always',
    "eyebrow" TEXT NOT NULL DEFAULT 'ΠΡΟΣΦΟΡΑ',
    "title" TEXT NOT NULL DEFAULT 'Δώρο ενυδάτωση',
    "body" TEXT NOT NULL DEFAULT 'Με κάθε πεντικιούρ, δώρο μια θεραπεία ενυδάτωσης.',
    "ctaLabel" TEXT NOT NULL DEFAULT 'Κλείσε Ραντεβού',
    "ctaUrl" TEXT,
    "imageUrl" TEXT,
    "delayMs" INTEGER NOT NULL DEFAULT 1200,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoPopupSettings_pkey" PRIMARY KEY ("id")
);
