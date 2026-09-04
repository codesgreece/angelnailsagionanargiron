export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { LegalPageView, legalMetadata } from "@/components/public/legal-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("/terms", "Όροι Χρήσης | Angel Nails");
}

export default function TermsPage() {
  return <LegalPageView slug="terms" path="/terms" fallbackTitle="Όροι Χρήσης" />;
}
