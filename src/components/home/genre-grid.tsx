import Link from "next/link";
import { siteConfig } from "@/config/site";
import AnimatedSection from "@/components/ui/animated-section";
import SectionHeading from "@/components/ui/section-heading";
import Container from "@/components/ui/container";
import { getImagePath } from "@/lib/utils";

const genreImages: Record<string, string> = {
  wildlife: "/images/wildlife/wildlife-cover.jpg",
  portraits: "/images/portraits/portraits-cover.jpg",
  pets: "/images/pets/pets-cover.jpg",
  motorsport: "/images/motorsport/motorsport-cover.jpg",
};

export default function GenreGrid() {
  return (
    <section className="py-24">
      <Container>
        <AnimatedSection>
          <SectionHeading
            title="Explore The Archive"
            subtitle="From quiet animal portraits to high-energy moments, each collection holds a different rhythm."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.categories.map((category, index) => (
            <AnimatedSection key={category.slug} animation="scale-in" delay={index * 90}>
              <Link
                href={`/portfolio?category=${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-sm border border-foreground/15"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  style={{ backgroundImage: `url(${getImagePath(genreImages[category.slug])})` }}
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,13,0.2)_10%,rgba(23,18,13,0.78)_100%)] transition-[opacity,background] duration-400 ease-out group-hover:bg-[linear-gradient(180deg,rgba(23,18,13,0.15)_10%,rgba(23,18,13,0.6)_100%)]" />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3
                    className="font-heading text-surface"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 1.875rem)" }}
                  >
                    {category.label}
                  </h3>
                  <div className="mt-3 h-[2px] w-12 origin-left bg-accent transition-transform duration-400 ease-out group-hover:scale-x-150" />
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}
