import { describe, expect, it } from "vitest";
import { formatDuration, formatPrice, slugify, whatsappUrl } from "../src/lib/utils";

describe("utils", () => {
  it("formats euro prices", () => {
    expect(formatPrice(23)).toContain("23");
    expect(formatPrice(15, true).toLowerCase()).toContain("από");
  });

  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45 λεπτά");
    expect(formatDuration(60)).toBe("1 ώρα");
    expect(formatDuration(75)).toContain("15");
  });

  it("slugifies greek-ish text", () => {
    expect(slugify("Manicure Semi")).toBe("manicure-semi");
  });

  it("builds whatsapp urls", () => {
    expect(whatsappUrl("6948384776")).toContain("306948384776");
  });
});
