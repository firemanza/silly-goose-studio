import type { Metadata } from "next";
import Container from "@/components/ui/container";
import AnimatedSection from "@/components/ui/animated-section";
import { siteConfig } from "@/config/site";
import { getAboutPageContent } from "@/lib/site-content";
import { getImagePath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Two photographers based in Gauteng, South Africa, shooting wildlife, pets, portraits, motorsport, and more.",
};

export default async function AboutPage() {
  const aboutContent = await getAboutPageContent();

  return (
    <section className="pb-24 pt-36 sm:pt-40">
      <Container>
        <AnimatedSection>
          <div className="space-y-10">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-foreground/14">
                <div
                  className="h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${getImagePath(aboutContent.primary_image)})`,
                    backgroundColor: "#d8cdb7",
                  }}
                />
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-foreground/14 bg-panel">
                <div
                  className="h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${getImagePath(aboutContent.secondary_image)})`,
                    backgroundColor: "#d8cdb7",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(24,22,26,0.8))] p-5 text-surface">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface/75">
                    Second Photographer
                  </p>
                  <p className="mt-2 text-sm">{aboutContent.secondary_caption}</p>
                </div>
              </div>
            </div>

            <div className="max-w-3xl">
              <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">{aboutContent.eyebrow}</p>
              <h1
                className="mt-2 font-heading text-foreground"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.75rem)" }}
              >
                {aboutContent.title}
              </h1>
              <div className="mt-5 h-[2px] w-20 bg-accent" />
              <p className="mt-8 text-lg leading-relaxed text-foreground/82">{aboutContent.intro}</p>
              <div className="mt-6 space-y-4 text-muted">
                {aboutContent.paragraphs.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-8">
          <div className="rounded-sm border border-accent/30 bg-accent/8 p-8">
            <h2 className="font-heading text-3xl text-foreground">{aboutContent.panel_title}</h2>
            <p className="mt-4 leading-relaxed text-muted">{aboutContent.panel_body}</p>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-foreground/20 px-5 py-2 text-xs tracking-[0.14em] text-foreground uppercase transition-all hover:border-accent hover:text-accent"
          >
            Follow on Instagram
          </a>
        </AnimatedSection>
      </Container>
    </section>
  );
}
