import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LibraryClient from "./library-client";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: photos }, { data: categories }, { data: photographers }] = await Promise.all([
    supabase.from("photos").select("*").order("updated_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("profiles").select("id, email, display_name").order("display_name"),
  ]);

  return (
    <LibraryClient
      currentUserId={user.id}
      currentUserEmail={user.email ?? ""}
      initialPhotos={photos ?? []}
      categories={categories ?? []}
      photographers={photographers ?? []}
    />
  );
}
