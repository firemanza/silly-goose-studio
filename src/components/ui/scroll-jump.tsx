"use client";

import { useEffect, useState } from "react";

export default function ScrollJump() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 240);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 sm:hidden">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="rounded-full border border-black/10 bg-white/92 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black shadow-[0_12px_30px_rgba(28,24,20,0.14)] backdrop-blur transition hover:bg-black hover:text-white"
        aria-label="Scroll to top"
      >
        Top
      </button>
      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          })
        }
        className="rounded-full border border-black/10 bg-white/92 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black shadow-[0_12px_30px_rgba(28,24,20,0.14)] backdrop-blur transition hover:bg-black hover:text-white"
        aria-label="Scroll to bottom"
      >
        Bottom
      </button>
    </div>
  );
}
