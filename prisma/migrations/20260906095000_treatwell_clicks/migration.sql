-- CreateTable
CREATE TABLE "TreatwellClick" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '/',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreatwellClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TreatwellClick_createdAt_idx" ON "TreatwellClick"("createdAt");

-- CreateIndex
CREATE INDEX "TreatwellClick_source_idx" ON "TreatwellClick"("source");

-- CreateIndex
CREATE INDEX "TreatwellClick_source_createdAt_idx" ON "TreatwellClick"("source", "createdAt");
