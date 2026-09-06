import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  await requireAdminPage();

  const [
    totalServices,
    activeServices,
    featuredServices,
    galleryImages,
    teamMembers,
    siteViews,
    treatwellClicks,
    recentAudits,
  ] = await Promise.all([
    prisma.service.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.service.count({ where: { featured: true, active: true } }),
    prisma.galleryImage.count({ where: { active: true } }),
    prisma.teamMember.count({ where: { active: true } }),
    prisma.siteView.count(),
    prisma.treatwellClick.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: true },
    }),
  ]);

  const cards = [
    { label: "Total services", value: totalServices, href: "/admin/services" },
    { label: "Active services", value: activeServices, href: "/admin/services" },
    { label: "Featured", value: featuredServices, href: "/admin/services/featured" },
    { label: "Gallery images", value: galleryImages, href: "/admin/gallery" },
    { label: "Team members", value: teamMembers, href: "/admin/team" },
    { label: "Site views", value: siteViews, href: "/admin" },
    { label: "Treatwell κλικ", value: treatwellClicks, href: "/admin/analytics/treatwell" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-white/50">Angel Nails content overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-white/10 bg-[#17171A] p-5 transition hover:border-[#ED2F78]/40"
          >
            <p className="text-sm text-white/50">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#17171A] p-5">
          <h2 className="text-lg font-medium">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["/admin/services", "Υπηρεσίες"],
              ["/admin/gallery/upload", "Upload"],
              ["/admin/business/hours", "Ωράριο"],
              ["/admin/content/homepage", "Homepage"],
              ["/admin/business/treatwell", "Treatwell"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#17171A] p-5">
          <h2 className="text-lg font-medium">Recent activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recentAudits.length === 0 && <li className="text-white/40">Καμία καταγραφή ακόμα.</li>}
            {recentAudits.map((a) => (
              <li key={a.id} className="border-b border-white/5 pb-2 text-white/70">
                <span className="text-white">{a.action}</span> · {a.entity}
                <span className="block text-xs text-white/40">
                  {a.user?.email || "system"} · {a.createdAt.toLocaleString("el-GR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
