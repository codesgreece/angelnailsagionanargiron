-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN     "lookbookCategory" TEXT,
ADD COLUMN     "lookbookDescription" TEXT,
ADD COLUMN     "lookbookEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lookbookFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lookbookOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lookbookTitle" TEXT,
ADD COLUMN     "serviceId" TEXT;

-- CreateTable
CREATE TABLE "LookbookSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL DEFAULT 'THE ANGEL NAILS BOOK',
    "subtitle" TEXT NOT NULL DEFAULT 'NAIL LOOKS • DETAILS • INSPIRATION',
    "coverImageUrl" TEXT,
    "coverLogoUrl" TEXT,
    "coverBackground" TEXT NOT NULL DEFAULT '#09090B',
    "accentColor" TEXT NOT NULL DEFAULT '#ED2F78',
    "homepageEnabled" BOOLEAN NOT NULL DEFAULT true,
    "homepageBlurb" TEXT NOT NULL DEFAULT 'Μια ματιά στα looks που δημιουργούμε.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LookbookSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryImage_lookbookEnabled_lookbookOrder_idx" ON "GalleryImage"("lookbookEnabled", "lookbookOrder");
