import { INTRO_STORAGE_KEY, type IntroFrequency } from "@/lib/intro/types";

type Stored = {
  firstPlayedAt?: number;
  lastPlayedAt?: number;
  sessionPlayed?: boolean;
};

function read(): Stored {
  try {
    const raw = localStorage.getItem(INTRO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : {};
  } catch {
    return {};
  }
}

function write(data: Stored) {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function shouldPlayIntro(frequency: IntroFrequency, force = false): boolean {
  if (force) return true;
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const data = read();

  // session flag via sessionStorage
  const sessionKey = `${INTRO_STORAGE_KEY}_session`;
  const sessionPlayed = sessionStorage.getItem(sessionKey) === "1";

  switch (frequency) {
    case "always":
      return true;
    case "first":
      return !data.firstPlayedAt;
    case "daily": {
      if (!data.lastPlayedAt) return true;
      return now - data.lastPlayedAt > 24 * 60 * 60 * 1000;
    }
    case "session":
    default:
      return !sessionPlayed;
  }
}

export function markIntroPlayed() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const data = read();
  write({
    firstPlayedAt: data.firstPlayedAt || now,
    lastPlayedAt: now,
  });
  try {
    sessionStorage.setItem(`${INTRO_STORAGE_KEY}_session`, "1");
  } catch {
    // ignore
  }
}
