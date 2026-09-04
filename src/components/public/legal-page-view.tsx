import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { getLegalPage, getSeoSettings } from "@/lib/services/content";
import { buildMetadata } from "@/lib/seo/metadata";
import sanitizeHtml from "sanitize-html";

function toHtml(markdownish: string) {
  const withHeadings = markdownish.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  const paragraphs = withHeadings
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("<h2>")) return block;
      return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
  return sanitizeHtml(paragraphs, {
    allowedTags: ["h2", "p", "br", "strong", "em", "ul", "ol", "li", "a"],
    allowedAttributes: { a: ["href", "target", "rel"] },
  });
}

export async function LegalPageView({
  slug,
  fallbackTitle,
}: {
  slug: string;
  path: string;
  fallbackTitle: string;
}) {
  const page = await getLegalPage(slug);
  if (!page) notFound();
  return (
    <div className="bg-[var(--brand-soft-white)] pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            {page.title || fallbackTitle}
          </h1>
          <div className="prose-legal mt-8" dangerouslySetInnerHTML={{ __html: toHtml(page.content) }} />
        </FadeIn>
      </div>
    </div>
  );
}

export async function legalMetadata(path: string, title: string): Promise<Metadata> {
  const seo = await getSeoSettings();
  return buildMetadata({ title, path, seo });
}
