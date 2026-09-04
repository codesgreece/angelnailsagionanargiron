export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { LegalPageView, legalMetadata } from "@/components/public/legal-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("/privacy-policy", "Πολιτική Απορρήτου | Angel Nails");
}

export default function PrivacyPolicyPage() {
  return <LegalPageView slug="privacy-policy" path="/privacy-policy" fallbackTitle="Πολιτική Απορρήτου" />;
}
