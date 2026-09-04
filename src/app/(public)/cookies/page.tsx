export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { LegalPageView, legalMetadata } from "@/components/public/legal-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("/cookies", "Πολιτική Cookies | Angel Nails");
}

export default function CookiesPage() {
  return <LegalPageView slug="cookies" path="/cookies" fallbackTitle="Πολιτική Cookies" />;
}
