import { cache } from "react";
import { prisma } from "@/lib/db";
import { DEFAULT_INTRO, type IntroConfig } from "@/lib/intro/types";

export const getIntroSettings = cache(async (): Promise<IntroConfig> => {
  try {
    return (
      (await prisma.introSettings.findUnique({ where: { id: "default" } })) ||
      (await prisma.introSettings.create({ data: { id: "default" } }))
    );
  } catch {
    return DEFAULT_INTRO;
  }
});
