import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { PageContentEditor } from "@/components/admin/page-content-editor";

export default async function Page() {
  await requireAdminPage();
  const [hero, intro, services] = await Promise.all([
    prisma.pageContent.findUnique({ where: { key: "home.hero" } }),
    prisma.pageContent.findUnique({ where: { key: "home.intro" } }),
    prisma.pageContent.findUnique({ where: { key: "home.services" } }),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Homepage</h1>
      <PageContentEditor pageKey="home.hero" title="Hero" initial={hero || {}} />
      <PageContentEditor pageKey="home.intro" title="Intro" initial={intro || {}} />
      <PageContentEditor pageKey="home.services" title="Featured services section" initial={services || {}} />
    </div>
  );
}
