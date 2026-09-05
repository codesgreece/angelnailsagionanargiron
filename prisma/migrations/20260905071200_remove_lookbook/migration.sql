-- DropIndex
DROP INDEX IF EXISTS "GalleryImage_lookbookEnabled_lookbookOrder_idx";

-- AlterTable
ALTER TABLE "GalleryImage" DROP COLUMN IF EXISTS "lookbookCategory",
DROP COLUMN IF EXISTS "lookbookDescription",
DROP COLUMN IF EXISTS "lookbookEnabled",
DROP COLUMN IF EXISTS "lookbookFeatured",
DROP COLUMN IF EXISTS "lookbookOrder",
DROP COLUMN IF EXISTS "lookbookTitle";

-- DropTable
DROP TABLE IF EXISTS "LookbookSettings";
