import type { IntroSettings } from "@prisma/client";

export type IntroStyle = "angel-reveal" | "logo-reveal" | "liquid-chrome" | "minimal";
export type IntroFrequency = "session" | "first" | "daily" | "always";
export type IntroQuality = "auto" | "high" | "medium" | "low";

export type IntroConfig = IntroSettings;

export const DEFAULT_INTRO: IntroConfig = {
  id: "default",
  enabled: true,
  style: "angel-reveal",
  playFrequency: "session",
  durationMs: 3200,
  showSkip: true,
  showSubtitle: true,
  showLoading: true,
  showPetals: true,
  showParticles: true,
  qualityMode: "auto",
  mobileQuality: "low",
  updatedAt: new Date(),
};

export const INTRO_STORAGE_KEY = "angel_nails_intro_v1";
