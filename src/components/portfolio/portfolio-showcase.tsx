/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { PortfolioImage } from "@/data/portfolio";
import type { PortfolioCategory } from "@/lib/portfolio-feed";
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

const mobileRotationPattern = [-1.4, 0.35, 1.15, -0.75, 0.8, -1.05, 1.3, -0.2];

function frameWidth(width: number, height: number) {
  const ratio = width / height;
  if (ratio > 1.15) return "w-[214px] sm:w-[239px]";
  if (ratio < 0.9) return "w-[172px] sm:w-[196px]";
  return "w-[189px] sm:w-[212px]";
}

function imageWindowSize(width: number, height: number) {
  const ratio = width / height;
  if (ratio > 1.15) return "aspect-[16/10]";
  if (ratio < 0.9) return "aspect-[5/6]";
  return "aspect-square";
}

function categoryAccent(category: string) {
  if (category === "wildlife") return "bg-emerald-200";
  if (category === "portraits") return "bg-amber-200";
  if (category === "pets") return "bg-rose-200";
  if (category === "motorsport") return "bg-sky-200";
  return "bg-stone-200";
}

function categoryFilterStyle(category: string, isActive: boolean) {
  if (category === "wildlife") {
    return isActive
      ? "border-emerald-500/60 bg-emerald-200 text-foreground shadow-[0_8px_18px_rgba(6,78,59,0.12)]"
      : "border-emerald-200 bg-emerald-100/70 text-foreground/75 hover:border-emerald-400 hover:bg-emerald-200 hover:text-foreground";
  }

  if (category === "portraits") {
    return isActive
      ? "border-amber-500/60 bg-amber-200 text-foreground shadow-[0_8px_18px_rgba(146,64,14,0.12)]"
      : "border-amber-200 bg-amber-100/70 text-foreground/75 hover:border-amber-400 hover:bg-amber-200 hover:text-foreground";
  }

  if (category === "pets") {
    return isActive
      ? "border-rose-500/60 bg-rose-200 text-foreground shadow-[0_8px_18px_rgba(159,18,57,0.12)]"
      : "border-rose-200 bg-rose-100/70 text-foreground/75 hover:border-rose-400 hover:bg-rose-200 hover:text-foreground";
  }

  if (category === "motorsport") {
    return isActive
      ? "border-sky-500/60 bg-sky-200 text-foreground shadow-[0_8px_18px_rgba(3,105,161,0.12)]"
      : "border-sky-200 bg-sky-100/70 text-foreground/75 hover:border-sky-400 hover:bg-sky-200 hover:text-foreground";
  }

  return isActive
    ? "border-stone-500/55 bg-stone-200 text-foreground shadow-[0_8px_18px_rgba(68,64,60,0.12)]"
    : "border-stone-200 bg-stone-100/75 text-foreground/75 hover:border-stone-400 hover:bg-stone-200 hover:text-foreground";
}

function categoryLabel(slug: string, categories: PortfolioCategory[]) {
  if (slug === "all") return "All Work";
  return categories.find((category) => category.slug === slug)?.label ?? slug;
}

export default function PortfolioShowcase({
  images,
  categories,
}: {
  images: PortfolioImage[];
  categories: PortfolioCategory[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    if (activeCategory === "all") return images;
    return images.filter((image) => image.category === activeCategory);
  }, [activeCategory, images]);

  useEffect(() => {
    const preloadBatch = filteredImages.slice(0, 18);

    preloadBatch.forEach((image) => {
      const preloader = new window.Image();
      preloader.decoding = "async";
      preloader.src = getImagePath(image.thumbnailSrc ?? image.src);
    });

    const warmRemainingImages = () => {
      filteredImages.slice(18).forEach((image) => {
        const preloader = new window.Image();
        preloader.decoding = "async";
        preloader.src = getImagePath(image.thumbnailSrc ?? image.src);
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warmRemainingImages);
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(warmRemainingImages, 300);
    return () => globalThis.clearTimeout(timeoutId);
  }, [filteredImages]);

  const previewImage =
    hoveredIndex !== null && hoveredIndex < filteredImages.length
      ? filteredImages[hoveredIndex]
      : filteredImages[0] ?? null;
  const previewIndex =
    hoveredIndex !== null && hoveredIndex < filteredImages.length ? hoveredIndex : 0;

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
            categoryFilterStyle("all", activeCategory === "all")
          )}
        >
          All Work
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            onClick={() => setCategory(category.slug)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-200 sm:px-5",
              categoryFilterStyle(category.slug, activeCategory === category.slug)
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 lg:hidden">
        <div className="grid grid-cols-2 gap-3 rounded-[1.8rem] border border-foreground/12 bg-[linear-gradient(150deg,rgba(250,245,234,0.98),rgba(236,226,205,0.95))] p-3 shadow-[0_20px_44px_rgba(35,28,20,0.12)]">
          <div className="rounded-[1.15rem] border border-foreground/10 bg-surface/78 px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Category</p>
            <p className="mt-1 text-sm text-foreground">{categoryLabel(activeCategory, categories)}</p>
          </div>
          <div className="rounded-[1.15rem] border border-foreground/10 bg-surface/78 px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Frames</p>
            <p className="mt-1 text-sm text-foreground">{filteredImages.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredImages.map((image, index) => (
            <button
              key={`${image.src}-${activeCategory}`}
              onClick={() => openLightbox(index)}
              className={cn(
                "group relative cursor-pointer overflow-visible bg-[#fffdf8] px-2.5 pb-4 pt-2.5 text-left shadow-[0_14px_24px_rgba(35,28,20,0.14)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(35,28,20,0.18)]",
                "hover:ring-2 hover:ring-accent/25"
              )}
              style={{ rotate: `${mobileRotationPattern[index % mobileRotationPattern.length]}deg` }}
            >
              <span
                className={cn(
                  "pointer-events-none absolute z-10 h-4 w-12 rounded-[2px] border border-amber-200/70 bg-[linear-gradient(180deg,rgba(245,238,215,0.95),rgba(235,224,193,0.9))] shadow-sm",
                  index % 3 === 0 ? "left-[14%] -top-2 -rotate-2" : index % 3 === 1 ? "right-[14%] -top-2 rotate-2" : "left-[38%] -top-2 -rotate-1"
                )}
              />
              <div className="relative overflow-hidden border border-foreground/10 bg-[#eadfc8]">
                <img
                  src={getImagePath(image.thumbnailSrc ?? image.src)}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading={index < 6 ? "eager" : "lazy"}
                  fetchPriority={index < 3 ? "high" : "auto"}
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-1 pt-3">
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                  Frame {String(index + 1).padStart(2, "0")}
                </p>
                <span
                  className={cn(
                    "h-1.5 w-7 rounded-full opacity-85",
                    categoryAccent(image.category)
                  )}
                  aria-hidden="true"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(430px,520px)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(470px,560px)]">
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
                  "group relative cursor-pointer overflow-visible bg-[#fffdf8] p-3 pb-6 text-left shadow-[0_16px_28px_rgba(35,28,20,0.16)] transition-[transform,box-shadow,filter] duration-400 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(35,28,20,0.2)]",
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
                    src={getImagePath(image.thumbnailSrc ?? image.src)}
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
          <div className="sticky top-20">
            <LivePreviewCard
              image={previewImage}
              frameNumber={previewIndex + 1}
              label="Live Preview"
              priority
            />
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
  priority = false,
  compact = false,
}: {
  image: PortfolioImage | null;
  frameNumber: number;
  label: string;
  priority?: boolean;
  compact?: boolean;
}) {
  const [displayedImage, setDisplayedImage] = useState(image);

  useEffect(() => {
    if (!image || displayedImage?.src === image.src) return;

    const preloader = new window.Image();
    preloader.decoding = "async";
    preloader.onload = () => setDisplayedImage(image);
    preloader.src = getImagePath(image.src);
  }, [displayedImage?.src, image]);

  const activeImage = displayedImage ?? image;

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-foreground/16 bg-[linear-gradient(170deg,#fffef9,#f5ebd8)] shadow-[0_24px_60px_rgba(25,20,14,0.28)]",
        compact ? "rounded-[1.4rem] p-3" : "rounded-sm p-3"
      )}
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
          aspectRatio: activeImage ? `${activeImage.width} / ${activeImage.height}` : undefined,
          maxHeight: compact ? "52vh" : "78vh",
        }}
      >
        {activeImage ? (
          <div className={cn("flex h-full w-full items-center justify-center", compact ? "p-3" : "p-4")}>
            <img
              src={getImagePath(activeImage.src)}
              alt=""
              width={activeImage.width}
              height={activeImage.height}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : null}
      </div>
      <div className={cn("border-t border-foreground/10 px-1", compact ? "pt-3" : "pt-4")}>
        <p className={cn("font-heading text-foreground", compact ? "text-[2rem]" : "text-3xl")}>
          {activeImage?.title ?? "Untitled"}
        </p>
      </div>
    </div>
  );
}
