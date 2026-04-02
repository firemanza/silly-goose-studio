import Link from "next/link";
import { siteConfig } from "@/config/site";

const footerLinks = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-foreground/12 bg-[linear-gradient(180deg,rgba(251,247,236,0.5),rgba(233,225,208,0.85))]">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:items-end">
          <div>
            <Link
              href="/"
              className="inline-block font-heading tracking-[0.06em] uppercase text-foreground"
              style={{ fontSize: "clamp(1.5rem, 3vw, 1.875rem)" }}
            >
              {siteConfig.name}
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Wildlife, portrait, and pet photography rooted in patience, storytelling, and the untamed texture of Southern Africa.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Navigate</p>
            <ul className="mt-4 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/80 transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Based in</p>
            <p className="mt-4 text-sm text-foreground/85">{siteConfig.contact.location}</p>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-sm border border-foreground/20 px-4 py-2 text-xs tracking-[0.12em] uppercase text-foreground transition-all hover:border-accent hover:text-accent"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-foreground/10 pt-5">
          <p className="text-xs tracking-[0.08em] text-muted uppercase">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
