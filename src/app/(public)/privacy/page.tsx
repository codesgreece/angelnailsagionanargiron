export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { LegalPageView, legalMetadata } from "@/components/public/legal-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("/privacy", "Απόρρητο | Angel Nails");
}

export default function PrivacyPage() {
  return <LegalPageView slug="privacy" path="/privacy" fallbackTitle="Απόρρητο" />;
}
