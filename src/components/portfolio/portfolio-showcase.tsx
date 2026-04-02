/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { portfolioImages } from "@/data/portfolio";
import { cn, getImagePath } from "@/lib/utils";
import Lightbox from "@/components/portfolio/lightbox";

const tiltPattern = [
  "rotate-[-1.8deg]",
  "rotate-[1.1deg]",
  "rotate-[-0.9deg]",
  "rotate-[1.6deg]",
  "rotate-[-1.3deg]",
  "rotate-[0.5deg]",
  "rotate-[-0.4deg]",
];

const offsetPattern = [
  "translate-y-0",
  "translate-y-2",
  "-translate-y-1",
  "translate-y-1",
  "-translate-y-2",
  "translate-y-0",
];

const tapePattern = [
  "left-[12%] -top-3 -rotate-2",
  "right-[12%] -top-3 rotate-2",
  "left-[40%] -top-3 -rotate-1",
  "left-[20%] -top-3 rotate-1",
];

function frameWidth(width: number, height: number) {
  const ratio = width / height;
  if (ratio > 1.15) return "w-[230px] sm:w-[255px]";
  if (ratio < 0.9) return "w-[188px] sm:w-[212px]";
  return "w-[205px] sm:w-[228px]";
}

function imageWindowSize(width: number, height: number) {
  const ratio = width / height;
  if (ratio > 1.15) return "aspect-[16/10]";
  if (ratio < 0.9) return "aspect-[5/6]";
  return "aspect-square";
}

function categoryAccent(category: string) {
  if (category === "wildlife") return "bg-emerald-700";
  if (category === "portraits") return "bg-amber-700";
  if (category === "pets") return "bg-rose-700";
  return "bg-accent";
}

function categoryLabel(slug: string) {
  if (slug === "all") return "All Work";
  return siteConfig.categories.find((category) => category.slug === slug)?.label ?? slug;
}

export default function PortfolioShowcase() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    if (activeCategory === "all") return portfolioImages;
    return portfolioImages.filter((image) => image.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    filteredImages.slice(0, 12).forEach((image) => {
      const preloader = new window.Image();
      preloader.decoding = "async";
      preloader.src = getImagePath(image.src);
    });
  }, [filteredImages]);

  const previewImage =
    hoveredIndex !== null && hoveredIndex < filteredImages.length
      ? filteredImages[hoveredIndex]
      : filteredImages[0] ?? null;
  const previewIndex =
    hoveredIndex !== null && hoveredIndex < filteredImages.length ? hoveredIndex : 0;
  const secondaryPreviewIndex =
    filteredImages.length > 1 ? (previewIndex + 1) % filteredImages.length : null;
  const secondaryPreviewImage =
    secondaryPreviewIndex !== null ? filteredImages[secondaryPreviewIndex] : null;

  const featuredMobile = filteredImages[0] ?? null;

  const setCategory = (slug: string) => {
    setActiveCategory(slug);
    setHoveredIndex(null);
    setSelectedIndex(null);
  };

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const nextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filteredImages.length);
  };

  const prevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + filteredImages.length) % filteredImages.length);
  };

  if (filteredImages.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg text-muted">No images in this category yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 hidden items-center justify-center gap-3 lg:flex">
        <span className="h-px w-16 bg-foreground/20" />
        <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
          Curated Contact Wall
        </p>
        <span className="h-px w-16 bg-foreground/20" />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-3">
        <button
          onClick={() => setCategory("all")}
          className={cn(
            "cursor-pointer rounded-full border px-4 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-200 sm:px-5",
            activeCategory === "all"
              ? "border-foreground bg-foreground text-surface"
              : "border-foreground/20 bg-surface/75 text-muted hover:border-accent hover:text-accent"
          )}
        >
          All Work
        </button>
        {siteConfig.categories.map((category) => (
          <button
            key={category.slug}
            onClick={() => setCategory(category.slug)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-200 sm:px-5",
              activeCategory === category.slug
                ? "border-foreground bg-foreground text-surface"
                : "border-foreground/20 bg-surface/75 text-muted hover:border-accent hover:text-accent"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="space-y-6 lg:hidden">
        <div className="relative overflow-hidden rounded-[2rem] border border-foreground/12 bg-[linear-gradient(155deg,rgba(251,247,236,0.98),rgba(236,226,205,0.95))] p-4 shadow-[0_24px_50px_rgba(35,28,20,0.14)] sm:p-5">
          <div className="pointer-events-none absolute -right-10 -top-8 h-28 w-28 rounded-full bg-accent/12 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-foreground/8 blur-3xl" />

          {featuredMobile ? (
            <>
              <div className="relative overflow-hidden rounded-[1.55rem] border border-foreground/12 bg-[#e9ddc7]">
                <img
                  src={getImagePath(featuredMobile.src)}
                  alt={featuredMobile.alt}
                  width={featuredMobile.width}
                  height={featuredMobile.height}
                  className="h-[24rem] w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,13,0.08)_10%,rgba(20,16,13,0.02)_40%,rgba(20,16,13,0.76)_100%)]" />
                <div className="absolute inset-x-4 bottom-4 rounded-[1.2rem] border border-white/10 bg-black/28 px-4 py-4 backdrop-blur-sm">
                  <p className="font-mono text-[10px] tracking-[0.22em] text-white/72 uppercase">Field Notes</p>
                  <p className="mt-2 font-heading text-3xl text-surface">
                    {featuredMobile.title ?? "Featured Frame"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-surface/82">
                    Creative on desktop, but now easier to browse on mobile.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] border border-foreground/10 bg-surface/70 px-4 py-4">
                  <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">Category</p>
                  <p className="mt-2 text-base text-foreground">{categoryLabel(activeCategory)}</p>
                </div>
                <div className="rounded-[1.25rem] border border-foreground/10 bg-surface/70 px-4 py-4">
                  <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">Frames</p>
                  <p className="mt-2 text-base text-foreground">{filteredImages.length}</p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredImages.map((image, index) => (
            <button
              key={`${image.src}-${activeCategory}`}
              onClick={() => openLightbox(index)}
              className="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-foreground/10 bg-[#fffaf0] text-left shadow-[0_16px_36px_rgba(35,28,20,0.1)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_22px_44px_rgba(35,28,20,0.14)]"
            >
              <div className="relative overflow-hidden bg-[#eadfc8]">
                <img
                  src={getImagePath(image.src)}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading={index < 6 ? "eager" : "lazy"}
                  fetchPriority={index < 3 ? "high" : "auto"}
                  decoding="async"
                  className="h-80 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(33,27,21,0)_48%,rgba(33,27,21,0.6)_100%)]" />
                <span
                  className={cn(
                    "absolute left-4 top-4 inline-flex h-2.5 w-10 rounded-full opacity-90",
                    categoryAccent(image.category)
                  )}
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-heading text-[1.85rem] leading-none text-foreground">
                    {image.title ?? `Frame ${String(index + 1).padStart(2, "0")}`}
                  </p>
                  <p className="mt-2 text-sm text-muted">Tap for the full frame</p>
                </div>
                <span className="shrink-0 rounded-full border border-foreground/10 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(560px,620px)] lg:gap-6">
        <div className="relative overflow-hidden rounded-sm border border-foreground/12 bg-[linear-gradient(150deg,rgba(250,245,234,0.98),rgba(236,226,205,0.95))] p-5 shadow-[0_20px_40px_rgba(35,28,20,0.12)] sm:p-7">
          <div className="pointer-events-none absolute -left-10 top-8 h-36 w-36 rounded-full bg-accent/10 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-foreground/8 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(30,24,20,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(30,24,20,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent)]" />

          <div className="relative flex flex-wrap items-end justify-center gap-4 sm:gap-5">
            {filteredImages.map((image, index) => (
              <button
                key={image.src}
                onClick={() => openLightbox(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onFocus={() => setHoveredIndex(index)}
                className={cn(
                  "group relative cursor-pointer overflow-visible bg-[#fffdf8] p-3 pb-7 text-left shadow-[0_16px_28px_rgba(35,28,20,0.16)] transition-[transform,box-shadow,filter] duration-400 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(35,28,20,0.2)]",
                  frameWidth(image.width, image.height),
                  tiltPattern[index % tiltPattern.length],
                  offsetPattern[index % offsetPattern.length],
                  hoveredIndex === index && "ring-2 ring-accent/45"
                )}
                style={{ animation: `slide-up 0.5s ease-out ${index * 35}ms both` }}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute z-10 h-5 w-14 rounded-[2px] border border-amber-200/70 bg-[linear-gradient(180deg,rgba(245,238,215,0.95),rgba(235,224,193,0.9))] shadow-sm",
                    tapePattern[index % tapePattern.length]
                  )}
                />
                <div
                  className={cn(
                    "grid place-items-center border border-foreground/12 bg-[#efe5d1] p-2",
                    imageWindowSize(image.width, image.height)
                  )}
                >
                  <img
                    src={getImagePath(image.src)}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading={index < 8 ? "eager" : "lazy"}
                    fetchPriority={index < 4 ? "high" : "auto"}
                    decoding="async"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
                    Frame {String(index + 1).padStart(2, "0")}
                  </p>
                  <span
                    className={cn("h-1.5 w-8 rounded-full opacity-85", categoryAccent(image.category))}
                    aria-hidden="true"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="block">
          <div className="sticky top-20 grid gap-4 2xl:grid-cols-2">
            <LivePreviewCard
              image={previewImage}
              frameNumber={previewIndex + 1}
              label="Live Preview"
              description="Focused view for the hovered frame while you scan the wall."
              priority
            />
            {secondaryPreviewImage ? (
              <div className="hidden 2xl:block">
                <LivePreviewCard
                  image={secondaryPreviewImage}
                  frameNumber={secondaryPreviewIndex! + 1}
                  label="Next Frame"
                  description="A second live preview makes better use of wide screens."
                />
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {selectedIndex !== null ? (
        <Lightbox
          images={filteredImages}
          currentIndex={selectedIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      ) : null}
    </>
  );
}

function LivePreviewCard({
  image,
  frameNumber,
  label,
  description,
  priority = false,
}: {
  image: (typeof portfolioImages)[number] | null;
  frameNumber: number;
  label: string;
  description: string;
  priority?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-sm border border-foreground/16 bg-[linear-gradient(170deg,#fffef9,#f5ebd8)] p-3 shadow-[0_24px_60px_rgba(25,20,14,0.28)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#d66538,#c63d2f,#d66538)]" />
      <div className="mb-2 flex items-center justify-between border-b border-foreground/12 pb-2">
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">{label}</span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
          {String(frameNumber).padStart(2, "0")}
        </span>
      </div>
      <div
        className="w-full overflow-hidden border border-foreground/12 bg-[#efe5d1] shadow-inner"
        style={{
          aspectRatio: image ? `${image.width} / ${image.height}` : undefined,
          maxHeight: "72vh",
        }}
      >
        {image ? (
          <div className="flex h-full w-full items-center justify-center p-4">
            <img
              src={getImagePath(image.src)}
              alt=""
              width={image.width}
              height={image.height}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : null}
      </div>
      <div className="border-t border-foreground/10 px-1 pt-4">
        <p className="font-heading text-3xl text-foreground">{image?.title ?? "Untitled"}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}
