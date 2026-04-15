import type { Metadata } from "next";
import Container from "@/components/ui/container";
import AnimatedSection from "@/components/ui/animated-section";
import { siteConfig } from "@/config/site";
import { getAboutPageContent } from "@/lib/site-content";
import { getImagePath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Two photographers based in Gauteng, South Africa, shooting wildlife, pets, portraits, motorsport, and more.",
};

export default async function AboutPage() {
  const aboutContent = await getAboutPageContent();
  const storyCards = [aboutContent.intro, ...aboutContent.paragraphs].filter((item) => item.trim().length > 0);

  return (
    <section className="pb-24 pt-36 sm:pt-40">
      <Container className="max-w-[1320px]">
        <AnimatedSection>
          <div className="space-y-8 sm:space-y-10">
            <div className="max-w-[1180px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">{aboutContent.eyebrow}</p>
              <h1
                className="mt-4 font-heading font-semibold leading-[0.96] tracking-[-0.04em] text-foreground"
                style={{ fontSize: "clamp(2.9rem, 7vw, 5.4rem)" }}
              >
                {aboutContent.title}
              </h1>
            </div>

            <div className="grid max-w-[760px] gap-4 sm:grid-cols-2">
              {[aboutContent.primary_image, aboutContent.secondary_image]
                .filter((imagePath) => imagePath.trim().length > 0)
                .map((imagePath, index) => (
                  <figure
                    key={`${imagePath}-${index}`}
                    className="overflow-hidden rounded-[1.75rem] border border-[color:color-mix(in_oklab,var(--color-accent)_18%,white)] bg-[color:color-mix(in_oklab,var(--color-surface)_85%,white)] p-2 shadow-[0_18px_45px_rgba(33,27,21,0.05)]"
                  >
                    <div
                      className="aspect-[4/3] rounded-[1.2rem] bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${getImagePath(imagePath)})`,
                        backgroundColor: "#d8cdb7",
                      }}
                    />
                  </figure>
                ))}
            </div>

            <div className="h-px w-full bg-[color:color-mix(in_oklab,var(--color-muted)_38%,white)]" />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {storyCards.map((card, index) => (
                <AnimatedSection key={`${index}-${card.slice(0, 24)}`} animation="scale-in" delay={index * 70}>
                  <article className="flex h-full min-h-[190px] items-center justify-center rounded-[2rem] border border-[color:color-mix(in_oklab,var(--color-accent)_22%,white)] bg-[color:color-mix(in_oklab,var(--color-surface)_88%,white)] px-7 py-8 text-center shadow-[0_18px_45px_rgba(33,27,21,0.05)]">
                    <p className="max-w-[22ch] text-[1.15rem] leading-[1.45] text-foreground/92">{card}</p>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-8 sm:mt-10">
          <div className="h-px w-full bg-[color:color-mix(in_oklab,var(--color-muted)_38%,white)]" />
          <div className="mx-auto mt-8 max-w-[760px] text-center">
            <h2
              className="font-heading font-semibold leading-none tracking-[-0.04em] text-foreground"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)" }}
            >
              {aboutContent.panel_title}
            </h2>
            <div className="mx-auto mt-6 max-w-[340px] rounded-[1.75rem] border border-[color:color-mix(in_oklab,var(--color-accent)_22%,white)] bg-[color:color-mix(in_oklab,var(--color-surface)_88%,white)] px-8 py-6 shadow-[0_18px_45px_rgba(33,27,21,0.05)]">
              <p className="text-[1.15rem] leading-[1.5] text-foreground/92">{aboutContent.panel_body}</p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-10 text-center">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-foreground/18 bg-white/60 px-5 py-2.5 text-xs tracking-[0.14em] text-foreground uppercase transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            Follow on Instagram
          </a>
        </AnimatedSection>
      </Container>
    </section>
  );
}
