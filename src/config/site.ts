import { getImagePath } from "@/lib/utils";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Silly Goose Studio",
  tagline: process.env.NEXT_PUBLIC_TAGLINE || "Capturing moments that matter",
  description:
    "Professional photography portfolio showcasing wildlife, portraits, and pet photography in Johannesburg, South Africa.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.github.io",
  ogImage: getImagePath("/images/og-image.jpg"),

  social: {
    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
      "https://instagram.com/aperture_2_photography",
  },

  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "aperture.2.photos@gmail.com",
    location: process.env.NEXT_PUBLIC_LOCATION || "Johannesburg, South Africa",
  },

  categories: [
    { slug: "wildlife", label: "Wildlife & Nature" },
    { slug: "portraits", label: "Portraits" },
    { slug: "pets", label: "Pets" },
    { slug: "motorsport", label: "Motorsport" },
    { slug: "abstract", label: "Abstract" },
    { slug: "weddings", label: "Weddings" },
  ],
} as const;

export type Category = (typeof siteConfig.categories)[number]["slug"];
