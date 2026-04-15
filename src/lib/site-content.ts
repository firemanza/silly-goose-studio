import { aboutContent as fallbackAboutContent } from "@/data/about";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export interface AboutPageContent {
  eyebrow: string;
  title: string;
  intro: string;
  paragraphs: string[];
  primary_image: string;
  secondary_image: string;
  secondary_caption: string;
  panel_title: string;
  panel_body: string;
}

const fallbackContent: AboutPageContent = {
  eyebrow: "About",
  title: fallbackAboutContent.title,
  intro: fallbackAboutContent.intro,
  paragraphs: fallbackAboutContent.bio,
  primary_image: fallbackAboutContent.primaryImage,
  secondary_image: fallbackAboutContent.secondaryImage,
  secondary_caption: fallbackAboutContent.secondaryCaption,
  panel_title: fallbackAboutContent.panel.title,
  panel_body: fallbackAboutContent.panel.body,
};

function isAboutContent(value: unknown): value is AboutPageContent {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.eyebrow === "string" &&
    typeof record.title === "string" &&
    typeof record.intro === "string" &&
    Array.isArray(record.paragraphs) &&
    record.paragraphs.every((item) => typeof item === "string") &&
    typeof record.primary_image === "string" &&
    typeof record.secondary_image === "string" &&
    typeof record.secondary_caption === "string" &&
    typeof record.panel_title === "string" &&
    typeof record.panel_body === "string"
  );
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return fallbackContent;
  }

  const { data, error } = await supabase.from("site_content").select("value").eq("key", "about_page").single();

  if (error || !isAboutContent(data?.value)) {
    return fallbackContent;
  }

  return data.value;
}
