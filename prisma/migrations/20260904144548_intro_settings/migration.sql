-- CreateTable
CREATE TABLE "IntroSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "style" TEXT NOT NULL DEFAULT 'angel-reveal',
    "playFrequency" TEXT NOT NULL DEFAULT 'session',
    "durationMs" INTEGER NOT NULL DEFAULT 3200,
    "showSkip" BOOLEAN NOT NULL DEFAULT true,
    "showSubtitle" BOOLEAN NOT NULL DEFAULT true,
    "showLoading" BOOLEAN NOT NULL DEFAULT true,
    "showPetals" BOOLEAN NOT NULL DEFAULT true,
    "showParticles" BOOLEAN NOT NULL DEFAULT true,
    "qualityMode" TEXT NOT NULL DEFAULT 'auto',
    "mobileQuality" TEXT NOT NULL DEFAULT 'low',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntroSettings_pkey" PRIMARY KEY ("id")
);
