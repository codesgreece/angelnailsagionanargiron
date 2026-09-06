import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api";
import { getTreatwellClickStats } from "@/lib/analytics/treatwell-stats";

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const stats = await getTreatwellClickStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[admin/analytics/treatwell] failed", error);
    return NextResponse.json(
      { error: "Αποτυχία φόρτωσης στατιστικών Treatwell" },
      { status: 500 },
    );
  }
}
