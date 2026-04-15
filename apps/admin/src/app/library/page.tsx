import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LibraryClient from "./library-client";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: photos }, { data: categories }, { data: photographers }, { data: aboutPageContent }] = await Promise.all([
    supabase.from("photos").select("*").order("updated_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("profiles").select("id, email, display_name").order("display_name"),
    supabase.from("site_content").select("value").eq("key", "about_page").maybeSingle(),
  ]);

  const currentProfile = (photographers ?? []).find((profile) => profile.id === user.id);

  return (
    <LibraryClient
      currentUserId={user.id}
      currentUserLabel={
        currentProfile?.display_name ?? currentProfile?.email ?? user.email ?? "Admin user"
      }
      initialPhotos={photos ?? []}
      initialCategories={categories ?? []}
      photographers={photographers ?? []}
      initialAboutContent={aboutPageContent?.value ?? null}
    />
  );
}
