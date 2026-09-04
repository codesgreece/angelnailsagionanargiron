"use client";

import { useEffect, useState } from "react";
import type { IntroConfig } from "@/lib/intro/types";
import { shouldPlayIntro } from "@/lib/intro/should-play";
import { IntroOverlay } from "@/components/intro/intro-overlay";

export function IntroGate({
  config,
  force = false,
  onComplete,
}: {
  config: IntroConfig;
  force?: boolean;
  onComplete?: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!config.enabled && !force) {
      setShow(false);
      return;
    }
    setShow(
      shouldPlayIntro(
        config.playFrequency as "session" | "first" | "daily" | "always",
        force,
      ),
    );
  }, [config, force]);

  if (!show) return null;

  return (
    <IntroOverlay
      config={config}
      force={force}
      onDone={() => {
        setShow(false);
        onComplete?.();
      }}
    />
  );
}
