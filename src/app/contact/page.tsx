import { Suspense } from "react";
import type { Metadata } from "next";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import AnimatedSection from "@/components/ui/animated-section";
import ContactForm from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch for wildlife, portrait, or pet photography enquiries in Johannesburg.",
};

export default function ContactPage() {
  return (
    <section className="pb-24 pt-36 sm:pt-40">
      <Container>
        <SectionHeading
          title="Get In Touch"
          subtitle="Share the brief and I will reply within 48 hours with next steps and availability."
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <AnimatedSection className="lg:col-span-2">
            <Suspense fallback={<div className="h-96" />}>
              <ContactForm />
            </Suspense>
          </AnimatedSection>

          <AnimatedSection animation="fade-in" delay={180}>
            <div className="space-y-7 rounded-sm border border-foreground/12 bg-surface/70 p-7">
              <div>
                <h3 className="font-heading text-2xl text-foreground">Direct Email</h3>
                <a
                  href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent("Photography enquiry")}`}
                  className="mt-2 inline-flex items-center gap-2 rounded-sm border border-foreground/20 px-4 py-2 text-xs tracking-[0.14em] text-foreground uppercase transition-all hover:border-accent hover:text-accent"
                >
                  {siteConfig.contact.email}
                </a>
              </div>

              <div>
                <h3 className="font-heading text-2xl text-foreground">Location</h3>
                <p className="mt-2 text-sm text-muted">{siteConfig.contact.location}</p>
              </div>

              <div>
                <h3 className="font-heading text-2xl text-foreground">Response Time</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Typical response is within 48 hours. For urgent requests, Instagram DM works fastest.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-2xl text-foreground">Social</h3>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-sm border border-foreground/20 px-4 py-2 text-xs tracking-[0.14em] text-foreground uppercase transition-all hover:border-accent hover:text-accent"
                >
                  Instagram
                </a>
              </div>

              <div className="border-t border-foreground/12 pt-6">
                <p className="text-xs leading-relaxed text-muted">
                  If the form gives trouble, send a direct email instead. Pricing and booking details are shared after an initial conversation.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
}
