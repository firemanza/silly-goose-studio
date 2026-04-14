"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@shared/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate, slugify } from "@/lib/utils";

type Photo = Database["public"]["Tables"]["photos"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Photographer = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "display_name"
>;

type StatusFilter = "all" | "draft" | "published" | "archived";

function publicUrl(bucket: string, path: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function statusPill(status: string) {
  if (status === "published") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "archived") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

async function imageFromFile(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function resizeImage(file: File, maxDimension: number, quality: number) {
  const image = await imageFromFile(file);
  const ratio = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not initialize canvas");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) {
    throw new Error("Could not resize image");
  }

  return { blob, width, height };
}

export default function LibraryClient({
  currentUserId,
  currentUserEmail,
  initialPhotos,
  categories,
  photographers,
}: {
  currentUserId: string;
  currentUserEmail: string;
  initialPhotos: Photo[];
  categories: Category[];
  photographers: Photographer[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(initialPhotos[0]?.id ?? null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCategory, setUploadCategory] = useState(categories[0]?.slug ?? "wildlife");
  const [uploadPhotographer, setUploadPhotographer] = useState(currentUserId);
  const [uploadStatus, setUploadStatus] = useState<"draft" | "published">("draft");

  const [editTitle, setEditTitle] = useState(initialPhotos[0]?.title ?? "");
  const [editAltText, setEditAltText] = useState(initialPhotos[0]?.alt_text ?? "");
  const [editCaption, setEditCaption] = useState(initialPhotos[0]?.caption ?? "");
  const [editCategory, setEditCategory] = useState(initialPhotos[0]?.category_slug ?? categories[0]?.slug ?? "");
  const [editPhotographer, setEditPhotographer] = useState(initialPhotos[0]?.photographer_id ?? currentUserId);
  const [editStatus, setEditStatus] = useState<"draft" | "published" | "archived">(
    (initialPhotos[0]?.status as "draft" | "published" | "archived" | undefined) ?? "draft"
  );

  const filteredPhotos = useMemo(() => {
    return initialPhotos.filter((photo) => {
      const statusMatches = statusFilter === "all" || photo.status === statusFilter;
      const categoryMatches = categoryFilter === "all" || photo.category_slug === categoryFilter;
      return statusMatches && categoryMatches;
    });
  }, [categoryFilter, initialPhotos, statusFilter]);

  const selectedPhoto = useMemo(
    () =>
      filteredPhotos.find((photo) => photo.id === selectedId) ??
      initialPhotos.find((photo) => photo.id === selectedId) ??
      null,
    [filteredPhotos, initialPhotos, selectedId]
  );

  function syncEditor(photo: Photo | null) {
    if (!photo) return;
    setEditTitle(photo.title);
    setEditAltText(photo.alt_text ?? "");
    setEditCaption(photo.caption ?? "");
    setEditCategory(photo.category_slug);
    setEditPhotographer(photo.photographer_id ?? currentUserId);
    setEditStatus(photo.status as "draft" | "published" | "archived");
  }

  async function refresh() {
    router.refresh();
  }

  async function handleSignOut() {
    setBusyAction("signout");
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!uploadFile) {
      setError("Choose a photo before uploading.");
      return;
    }

    setBusyAction("upload");

    try {
      const baseName = `${Date.now()}-${slugify(uploadTitle || uploadFile.name.replace(/\.[^.]+$/, ""))}`;
      const originalExt = uploadFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const originalPath = `${uploadPhotographer}/${baseName}.${originalExt}`;
      const displayPath = `${uploadPhotographer}/${baseName}.jpg`;
      const thumbPath = `${uploadPhotographer}/${baseName}-thumb.jpg`;

      const [{ blob: displayBlob, width, height }, { blob: thumbBlob }] = await Promise.all([
        resizeImage(uploadFile, 2400, 0.86),
        resizeImage(uploadFile, 800, 0.78),
      ]);

      const [{ error: originalError }, { error: displayError }, { error: thumbError }] = await Promise.all([
        supabase.storage.from("photo-originals").upload(originalPath, uploadFile, { upsert: false }),
        supabase.storage.from("photo-display").upload(displayPath, displayBlob, {
          contentType: "image/jpeg",
          upsert: false,
        }),
        supabase.storage.from("photo-thumbs").upload(thumbPath, thumbBlob, {
          contentType: "image/jpeg",
          upsert: false,
        }),
      ]);

      if (originalError || displayError || thumbError) {
        throw new Error(originalError?.message || displayError?.message || thumbError?.message);
      }

      const { error: insertError } = await supabase.from("photos").insert({
        title: uploadTitle.trim(),
        alt_text: uploadAltText.trim() || uploadTitle.trim(),
        caption: uploadCaption.trim() || null,
        category_slug: uploadCategory,
        photographer_id: uploadPhotographer,
        created_by: currentUserId,
        updated_by: currentUserId,
        status: uploadStatus,
        published_at: uploadStatus === "published" ? new Date().toISOString() : null,
        display_path: displayPath,
        thumbnail_path: thumbPath,
        original_path: originalPath,
        width,
        height,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setNotice("Photo uploaded.");
      setUploadFile(null);
      setUploadTitle("");
      setUploadAltText("");
      setUploadCaption("");
      await refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function saveSelectedPhoto() {
    if (!selectedPhoto) return;

    setBusyAction("save");
    setError(null);
    setNotice(null);

    const becamePublished = editStatus === "published" && !selectedPhoto.published_at;

    const { error: updateError } = await supabase
      .from("photos")
      .update({
        title: editTitle.trim(),
        alt_text: editAltText.trim() || editTitle.trim(),
        caption: editCaption.trim() || null,
        category_slug: editCategory,
        photographer_id: editPhotographer || null,
        status: editStatus,
        published_at:
          editStatus === "published"
            ? becamePublished
              ? new Date().toISOString()
              : selectedPhoto.published_at
            : null,
        updated_by: currentUserId,
      })
      .eq("id", selectedPhoto.id);

    if (updateError) {
      setError(updateError.message);
      setBusyAction(null);
      return;
    }

    setNotice("Photo updated.");
    await refresh();
    setBusyAction(null);
  }

  async function archiveSelectedPhoto() {
    if (!selectedPhoto) return;

    setBusyAction("archive");
    setError(null);
    setNotice(null);

    const { error: updateError } = await supabase
      .from("photos")
      .update({
        status: "archived",
        published_at: null,
        updated_by: currentUserId,
      })
      .eq("id", selectedPhoto.id);

    if (updateError) {
      setError(updateError.message);
      setBusyAction(null);
      return;
    }

    setNotice("Photo archived.");
    await refresh();
    setBusyAction(null);
  }

  async function deleteSelectedPhoto() {
    if (!selectedPhoto) return;
    if (!window.confirm("Delete this photo and its stored files permanently?")) return;

    setBusyAction("delete");
    setError(null);
    setNotice(null);

    const removals: Promise<unknown>[] = [];

    if (selectedPhoto.original_path) {
      removals.push(supabase.storage.from(selectedPhoto.original_bucket).remove([selectedPhoto.original_path]));
    }

    removals.push(supabase.storage.from(selectedPhoto.display_bucket).remove([selectedPhoto.display_path]));

    if (selectedPhoto.thumbnail_path) {
      removals.push(supabase.storage.from(selectedPhoto.thumbnail_bucket).remove([selectedPhoto.thumbnail_path]));
    }

    await Promise.all(removals);

    const { error: deleteError } = await supabase.from("photos").delete().eq("id", selectedPhoto.id);

    if (deleteError) {
      setError(deleteError.message);
      setBusyAction(null);
      return;
    }

    setNotice("Photo deleted.");
    setSelectedId(null);
    await refresh();
    setBusyAction(null);
  }

  const draftCount = initialPhotos.filter((photo) => photo.status === "draft").length;
  const publishedCount = initialPhotos.filter((photo) => photo.status === "published").length;
  const archivedCount = initialPhotos.filter((photo) => photo.status === "archived").length;

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-[1560px] space-y-6">
        <header className="overflow-hidden rounded-[2rem] border bg-white/70 shadow-[0_24px_60px_rgba(28,24,20,0.08)] backdrop-blur">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.24em] text-[color:var(--color-muted)]">
                Silly Goose Studio Portal
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--color-ink)]">
                Working archive
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-muted)]">
                Upload new work, publish portfolio images, change categories, and archive older photos without touching the public site code.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-[1.6rem] border bg-[color:var(--color-surface)] p-4">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  Total
                </p>
                <p className="mt-4 text-3xl font-semibold">{initialPhotos.length}</p>
              </div>
              <div className="rounded-[1.6rem] border bg-[color:var(--color-surface)] p-4">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  Published
                </p>
                <p className="mt-4 text-3xl font-semibold">{publishedCount}</p>
              </div>
              <div className="rounded-[1.6rem] border bg-[color:var(--color-surface)] p-4">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  Drafts
                </p>
                <p className="mt-4 text-3xl font-semibold">{draftCount}</p>
              </div>
              <div className="rounded-[1.6rem] border bg-[color:var(--color-surface)] p-4">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                  Archived
                </p>
                <p className="mt-4 text-3xl font-semibold">{archivedCount}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[color:var(--color-muted)]">Signed in as {currentUserEmail}</p>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={busyAction === "signout"}
              className="cursor-pointer rounded-full border bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === "signout" ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        {notice ? (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-[1.8rem] border bg-white/75 p-4 shadow-[0_20px_50px_rgba(28,24,20,0.06)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {(["all", "draft", "published", "archived"] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                      statusFilter === status
                        ? "border-black bg-black text-white"
                        : "bg-[color:var(--color-surface)] text-[color:var(--color-muted)] hover:border-black/30 hover:text-[color:var(--color-ink)]"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-full border bg-[color:var(--color-surface)] px-4 py-2 text-sm text-[color:var(--color-ink)]"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredPhotos.map((photo) => {
                const photographer = photographers.find((item) => item.id === photo.photographer_id);
                const category = categories.find((item) => item.slug === photo.category_slug);
                const preview = publicUrl(photo.thumbnail_bucket, photo.thumbnail_path || photo.display_path);

                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(photo.id);
                      syncEditor(photo);
                    }}
                    className={cn(
                      "cursor-pointer overflow-hidden rounded-[1.8rem] border bg-white text-left shadow-[0_20px_50px_rgba(28,24,20,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(28,24,20,0.09)]",
                      selectedId === photo.id && "ring-2 ring-[color:var(--color-accent)]"
                    )}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[color:var(--color-panel)]">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={photo.alt_text ?? photo.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[color:var(--color-muted)]">
                          No preview
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold leading-tight text-[color:var(--color-ink)]">
                            {photo.title}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
                            {category?.label ?? photo.category_slug}
                          </p>
                        </div>
                        <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", statusPill(photo.status))}>
                          {photo.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[color:var(--color-muted)]">
                        <span>{photographer?.display_name ?? photographer?.email ?? "Unknown photographer"}</span>
                        <span>{formatDate(photo.published_at || photo.updated_at)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <form
              onSubmit={handleUpload}
              className="rounded-[1.8rem] border bg-white/80 p-5 shadow-[0_20px_50px_rgba(28,24,20,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                    Upload
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Add a new photo</h2>
                </div>
                <span className="rounded-full border bg-[color:var(--color-surface)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                  original + web + thumb
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                />

                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(event) => setUploadTitle(event.target.value)}
                  placeholder="Title"
                  className="w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                  required
                />

                <textarea
                  value={uploadAltText}
                  onChange={(event) => setUploadAltText(event.target.value)}
                  placeholder="Alt text"
                  rows={3}
                  className="w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                />

                <textarea
                  value={uploadCaption}
                  onChange={(event) => setUploadCaption(event.target.value)}
                  placeholder="Caption"
                  rows={3}
                  className="w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={uploadCategory}
                    onChange={(event) => setUploadCategory(event.target.value)}
                    className="rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={uploadPhotographer}
                    onChange={(event) => setUploadPhotographer(event.target.value)}
                    className="rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                  >
                    {photographers.map((photographer) => (
                      <option key={photographer.id} value={photographer.id}>
                        {photographer.display_name ?? photographer.email ?? photographer.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setUploadStatus("draft")}
                    className={cn(
                      "cursor-pointer rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      uploadStatus === "draft" ? "border-black bg-black text-white" : "bg-[color:var(--color-surface)]"
                    )}
                  >
                    Save as draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadStatus("published")}
                    className={cn(
                      "cursor-pointer rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      uploadStatus === "published"
                        ? "border-[color:var(--color-success)] bg-[color:var(--color-success)] text-white"
                        : "bg-[color:var(--color-surface)]"
                    )}
                  >
                    Publish immediately
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={busyAction === "upload"}
                  className="w-full cursor-pointer rounded-2xl bg-[color:var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyAction === "upload" ? "Uploading..." : "Upload photo"}
                </button>
              </div>
            </form>

            <section className="rounded-[1.8rem] border bg-white/80 p-5 shadow-[0_20px_50px_rgba(28,24,20,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                    Details
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Selected photo</h2>
                </div>
                {selectedPhoto ? (
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                      statusPill(selectedPhoto.status)
                    )}
                  >
                    {selectedPhoto.status}
                  </span>
                ) : null}
              </div>

              {selectedPhoto ? (
                <div className="mt-5 space-y-4">
                  <div className="overflow-hidden rounded-[1.5rem] border bg-[color:var(--color-panel)]">
                    {publicUrl(selectedPhoto.display_bucket, selectedPhoto.display_path) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={publicUrl(selectedPhoto.display_bucket, selectedPhoto.display_path)!}
                        alt={selectedPhoto.alt_text ?? selectedPhoto.title}
                        className="max-h-[360px] w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                  />

                  <textarea
                    value={editAltText}
                    onChange={(event) => setEditAltText(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                  />

                  <textarea
                    value={editCaption}
                    onChange={(event) => setEditCaption(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={editCategory}
                      onChange={(event) => setEditCategory(event.target.value)}
                      className="rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={editPhotographer}
                      onChange={(event) => setEditPhotographer(event.target.value)}
                      className="rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                    >
                      {photographers.map((photographer) => (
                        <option key={photographer.id} value={photographer.id}>
                          {photographer.display_name ?? photographer.email ?? photographer.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={editStatus}
                    onChange={(event) =>
                      setEditStatus(event.target.value as "draft" | "published" | "archived")
                    }
                    className="w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={saveSelectedPhoto}
                      disabled={busyAction === "save"}
                      className="cursor-pointer rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === "save" ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={archiveSelectedPhoto}
                      disabled={busyAction === "archive"}
                      className="cursor-pointer rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === "archive" ? "Archiving..." : "Archive"}
                    </button>
                    <button
                      type="button"
                      onClick={deleteSelectedPhoto}
                      disabled={busyAction === "delete"}
                      className="cursor-pointer rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === "delete" ? "Deleting..." : "Delete permanently"}
                    </button>
                  </div>

                  <div className="rounded-[1.4rem] border bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-muted)]">
                    {selectedPhoto.width && selectedPhoto.height
                      ? `${selectedPhoto.width} × ${selectedPhoto.height}`
                      : "Dimensions pending"}
                    {" · "}
                    Last updated {formatDate(selectedPhoto.updated_at)}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed bg-[color:var(--color-surface)] px-4 py-8 text-sm text-[color:var(--color-muted)]">
                  Select a photo from the library to edit it.
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
