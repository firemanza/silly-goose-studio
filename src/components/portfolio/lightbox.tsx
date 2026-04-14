"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useCallback, useMemo, useState } from "react";
import type { PortfolioImage } from "@/data/portfolio";
import { getImagePath } from "@/lib/utils";

interface LightboxProps {
  images: PortfolioImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const current = images[currentIndex];
  const [showFullResolution, setShowFullResolution] = useState(false);

  useEffect(() => {
    setShowFullResolution(false);
  }, [currentIndex]);

  const previewSrc = useMemo(() => {
    if (!current) return null;
    return current.displaySrc ?? current.src;
  }, [current]);

  const fullSrc = useMemo(() => {
    if (!current) return null;
    return current.fullSrc ?? current.displaySrc ?? current.src;
  }, [current]);

  const canShowFullResolution = Boolean(fullSrc && previewSrc && fullSrc !== previewSrc);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          onNext();
          break;
        case "ArrowLeft":
          onPrev();
          break;
      }
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/85 px-3 backdrop-blur-sm sm:px-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-sm border border-surface/30 text-surface/80 transition-colors hover:text-surface"
        aria-label="Close lightbox"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm border border-surface/30 bg-black/25 text-surface/80 transition-colors hover:text-surface sm:left-5"
        aria-label="Previous image"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm border border-surface/30 bg-black/25 text-surface/80 transition-colors hover:text-surface sm:right-5"
        aria-label="Next image"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="relative max-h-[86vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <img
          src={getImagePath(showFullResolution ? fullSrc ?? current.src : previewSrc ?? current.src)}
          alt={current.alt}
          className="max-h-[86vh] max-w-[92vw] rounded-sm object-contain"
        />
      </div>

      <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <div className="rounded-sm border border-surface/25 px-3 py-1 text-xs tracking-[0.1em] text-surface/80 uppercase">
          {currentIndex + 1} / {images.length}
        </div>
        {canShowFullResolution ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullResolution((value) => !value);
            }}
            className="rounded-sm border border-surface/25 px-3 py-1 text-xs tracking-[0.1em] text-surface/85 uppercase transition-colors hover:border-surface/50 hover:text-surface"
          >
            {showFullResolution ? "Show Web Size" : "Load Full Resolution"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
