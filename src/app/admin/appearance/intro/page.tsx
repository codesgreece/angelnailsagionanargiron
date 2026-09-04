import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { IntroAdmin } from "@/components/admin/intro-admin";

export default async function AdminIntroPage() {
  await requireAdminPage();
  const settings = await prisma.introSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  return <IntroAdmin initial={JSON.parse(JSON.stringify(settings))} />;
}
