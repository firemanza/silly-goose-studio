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
          "title, alt_text, category_slug, width, height, thumbnail_bucket, thumbnail_path, display_bucket, display_path, original_bucket, original_path"
        )
        .eq("status", "published")
        .order("sort_order", { ascending: false })
        .order("published_at", { ascending: false }),
    ]);

  if (categoryError || photoError || !photoRows?.length) {
    return {
      categories: [...siteConfig.categories],
      images: legacyPortfolioImages,
      source: "legacy",
    };
  }

  return {
    categories:
      categoryRows?.map((category) => ({
        slug: category.slug,
        label: category.label,
      })) ?? [...siteConfig.categories],
    images: photoRows.map((photo) => ({
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
    })),
    source: "supabase",
  };
}
