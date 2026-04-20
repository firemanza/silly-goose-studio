import { siteConfig } from "@/config/site";
import { portfolioImages as legacyPortfolioImages, type PortfolioImage } from "@/data/portfolio";
import { createPublicSupabaseClient, getSupabasePublicFileUrl } from "@/lib/supabase/public";

export interface PortfolioCategory {
  slug: string;
  label: string;
}

export interface PortfolioFeed {
  categories: PortfolioCategory[];
  images: PortfolioImage[];
  source: "supabase" | "legacy";
}

function dayStableSeed(): number {
  const now = new Date();
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(array: T[], rng: () => number) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function mixImagesForAllView(images: PortfolioImage[]): PortfolioImage[] {
  const rng = mulberry32(dayStableSeed());
  const groupedImages = new Map<string, PortfolioImage[]>();

  images.forEach((image) => {
    const bucket = groupedImages.get(image.category);
    if (bucket) {
      bucket.push(image);
    } else {
      groupedImages.set(image.category, [image]);
    }
  });

  for (const bucket of groupedImages.values()) {
    shuffleInPlace(bucket, rng);
  }

  const queue = Array.from(groupedImages.keys()).filter((slug) => {
    const bucket = groupedImages.get(slug);
    return bucket ? bucket.length > 0 : false;
  });
  shuffleInPlace(queue, rng);

  const mixedImages: PortfolioImage[] = [];

  while (queue.length > 0) {
    const currentSlug = queue.shift();
    if (!currentSlug) continue;

    const bucket = groupedImages.get(currentSlug);
    if (!bucket?.length) continue;

    const nextImage = bucket.shift();
    if (nextImage) {
      mixedImages.push(nextImage);
    }

    if (bucket.length > 0) {
      queue.push(currentSlug);
    }
  }

  return mixedImages;
}

export async function getPortfolioFeed(): Promise<PortfolioFeed> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return {
      categories: [...siteConfig.categories],
      images: legacyPortfolioImages,
      source: "legacy",
    };
  }

  const [{ data: categoryRows, error: categoryError }, { data: photoRows, error: photoError }] =
    await Promise.all([
      supabase.from("categories").select("slug, label, sort_order").eq("is_active", true).order("sort_order"),
      supabase
        .from("photos")
        .select(
          "title, alt_text, category_slug, width, height, thumbnail_bucket, thumbnail_path, display_bucket, display_path, original_bucket, original_path, watermark_position"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .order("updated_at", { ascending: false })
        .order("sort_order", { ascending: false }),
    ]);

  if (categoryError || photoError || !photoRows?.length) {
    return {
      categories: [...siteConfig.categories],
      images: legacyPortfolioImages,
      source: "legacy",
    };
  }

  const categories =
    categoryRows?.map((category) => ({
      slug: category.slug,
      label: category.label,
    })) ?? [...siteConfig.categories];

  const images = photoRows.map((photo) => ({
      src: getSupabasePublicFileUrl(photo.display_bucket, photo.display_path),
      alt: photo.alt_text ?? photo.title,
      category: photo.category_slug,
      width: photo.width ?? 2400,
      height: photo.height ?? 1600,
      title: photo.title,
      thumbnailSrc: getSupabasePublicFileUrl(
        photo.thumbnail_bucket,
        photo.thumbnail_path ?? photo.display_path
      ),
      displaySrc: getSupabasePublicFileUrl(photo.display_bucket, photo.display_path),
      fullSrc: getSupabasePublicFileUrl(photo.display_bucket, photo.display_path),
    }));

  return {
    categories,
    images: mixImagesForAllView(images),
    source: "supabase",
  };
}
