import type { Metadata } from "next";
import Container from "@/components/ui/container";
import AnimatedSection from "@/components/ui/animated-section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch for wildlife, portrait, or pet photography enquiries in Johannesburg.",
};

export default function ContactPage() {
  const emailHref = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
    "Photography enquiry"
  )}`;

  const instagramLabel = siteConfig.social.instagram
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")
    .replace(/\/$/, "");

  return (
    <section className="pb-24 pt-36 sm:pt-40">
      <Container className="max-w-6xl">
        <AnimatedSection>
          <div className="grid gap-10 border-b border-foreground/12 pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-accent uppercase">
                Contact / 01
              </p>
              <h1
                className="mt-6 font-heading leading-tight text-foreground"
                style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
              >
                Start with a conversation.
              </h1>
              <div className="mt-6 h-[2px] w-20 bg-accent" />
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
                For availability, pricing, and commission details, reach out via direct email or Instagram DM. I respond within 48 hours.
              </p>
            </div>

            <div className="grid content-end gap-6 text-sm leading-relaxed text-muted sm:grid-cols-3">
              <div className="border-t border-foreground/14 pt-5">
                <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
                  Response
                </p>
                <p className="mt-3 text-foreground/80">Within 48h</p>
              </div>
              <div className="border-t border-foreground/14 pt-5">
                <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
                  Location
                </p>
                <p className="mt-3 text-foreground/80">{siteConfig.contact.location}</p>
              </div>
              <div className="border-t border-foreground/14 pt-5">
                <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
                  Details
                </p>
                <p className="mt-3 text-foreground/80">
                  Shared after the initial conversation.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <AnimatedSection delay={120}>
            <a
              href={emailHref}
              className="group block h-full min-h-72 rounded-sm border border-foreground/14 bg-surface/60 p-7 transition-colors duration-200 hover:border-accent/70 hover:bg-accent/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-9"
              aria-label={`Email ${siteConfig.contact.email}`}
            >
              <div className="flex h-full flex-col justify-between gap-14">
                <div className="flex items-start justify-between gap-6">
                  <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
                    A / Direct Email
                  </p>
                  <span className="text-2xl text-accent transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <div>
                  <h2 className="font-heading text-4xl leading-none text-foreground sm:text-5xl">
                    Write directly
                  </h2>
                  <p className="mt-5 break-words text-base text-muted sm:text-lg">
                    {siteConfig.contact.email}
                  </p>
                </div>
              </div>
            </a>
          </AnimatedSection>

          <AnimatedSection delay={220}>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full min-h-72 rounded-sm border border-foreground/14 bg-surface/60 p-7 transition-colors duration-200 hover:border-accent/70 hover:bg-accent/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-9"
              aria-label="Open Instagram"
            >
              <div className="flex h-full flex-col justify-between gap-14">
                <div className="flex items-start justify-between gap-6">
                  <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
                    B / Instagram DM
                  </p>
                  <span className="text-2xl text-accent transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <div>
                  <h2 className="font-heading text-4xl leading-none text-foreground sm:text-5xl">
                    Send a DM
                  </h2>
                  <p className="mt-5 break-words text-base text-muted sm:text-lg">
                    {instagramLabel}
                  </p>
                </div>
              </div>
            </a>
          </AnimatedSection>
        </div>

        <AnimatedSection animation="fade-in" delay={320}>
          <div className="mt-14 grid gap-8 border-t border-foreground/12 pt-10 lg:grid-cols-[0.35fr_1fr]">
            <p className="font-mono text-xs tracking-[0.22em] text-accent uppercase">
              Note / 02
            </p>
            <p className="max-w-3xl text-base leading-relaxed text-muted md:text-lg">
              Pricing, scope, and booking requirements are shared after a short initial conversation, so the quote can match the work rather than a generic package.
            </p>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
