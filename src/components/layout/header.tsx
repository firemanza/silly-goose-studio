"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 36);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 lg:px-8 xl:px-10 sm:pt-5">
      <nav
        className={cn(
          "mx-auto w-full max-w-[1800px] rounded-[1.5rem] border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out",
          isScrolled
            ? "border-foreground/12 bg-surface/96 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur"
            : "border-foreground/10 bg-surface/82 backdrop-blur-sm"
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="group flex shrink-0 items-end gap-2 text-foreground">
              <span
                className="whitespace-nowrap font-heading text-lg leading-none tracking-[0.06em] uppercase sm:text-xl"
              >
                {siteConfig.name}
              </span>
              <span className="mb-0.5 hidden h-px w-10 origin-left bg-accent transition-transform group-hover:scale-x-125 sm:block" />
            </Link>
            <div className="hidden min-[860px]:block">
              <p className="font-mono text-[10px] tracking-[0.24em] text-muted uppercase">Based in</p>
              <p className="mt-1 text-xs text-foreground/78">{siteConfig.contact.location}</p>
            </div>
          </div>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative inline-flex rounded-sm px-4 py-2 text-xs tracking-[0.18em] uppercase transition-[color,background-color,border-color] duration-250 ease-out",
                      active
                        ? "bg-foreground text-surface"
                        : "text-muted hover:bg-foreground/8 hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/contact"
            className="hidden rounded-full border border-foreground/12 bg-foreground px-4 py-2 text-[11px] tracking-[0.18em] text-surface uppercase transition-colors duration-200 hover:bg-accent lg:inline-flex"
          >
            Book a Session
          </Link>

          <button
            className="relative z-50 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-foreground/12 bg-surface/92 lg:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "block h-0.5 w-5 bg-foreground transition-[transform,opacity] duration-300 ease-out",
                  isMobileMenuOpen && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-foreground transition-[transform,opacity] duration-300 ease-out",
                  isMobileMenuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-foreground transition-[transform,opacity] duration-300 ease-out",
                  isMobileMenuOpen && "-translate-y-2 -rotate-45"
                )}
              />
            </div>
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(15,23,42,0.28)] transition-opacity duration-300 ease-out lg:hidden",
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={closeMobileMenu}
      >
        <div
          className={cn(
            "absolute inset-x-4 top-20 rounded-[2rem] border border-foreground/10 bg-surface px-5 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.18)] transition-[opacity,transform] duration-300 ease-out",
            isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(198,61,47,0.12),rgba(255,250,241,0.92))] p-4">
            <p className="font-mono text-[10px] tracking-[0.24em] text-muted uppercase">Now Booking</p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-2xl text-foreground">Field Sessions</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Editorial portraits, wildlife stories, and private commissions.
                </p>
              </div>
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="shrink-0 rounded-full bg-foreground px-4 py-2 text-[11px] tracking-[0.18em] text-surface uppercase"
              >
                Enquire
              </Link>
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                style={{ transitionDelay: `${index * 45}ms` }}
                className={cn(
                  "transition-[opacity,transform] duration-300 ease-out",
                  isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                )}
              >
                <Link
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3",
                    pathname === link.href
                      ? "border-foreground/14 bg-foreground text-surface"
                      : "border-foreground/10 bg-white/70 text-foreground"
                  )}
                >
                  <span className="font-heading text-2xl tracking-[0.04em]">{link.label}</span>
                  <span className={cn("text-[11px] tracking-[0.22em] uppercase", pathname === link.href ? "text-surface/80" : "text-muted")}>
                    Open
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-foreground/10 bg-white/70 px-4 py-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.24em] text-muted uppercase">Location</p>
              <p className="mt-1 text-sm text-foreground/78">{siteConfig.contact.location}</p>
            </div>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-foreground/10 px-3 py-2 text-[11px] tracking-[0.18em] text-foreground uppercase"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
