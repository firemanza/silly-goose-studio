"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@shared/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate, slugify } from "@/lib/utils";
import {
  createWatermarkedRendition,
  WATERMARK_OPTIONS,
  WATERMARK_POSITIONS,
  type WatermarkAsset,
  type WatermarkPosition,
} from "@/lib/watermark";

type Photo = Database["public"]["Tables"]["photos"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Photographer = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "display_name"
>;

type StatusFilter = "all" | "draft" | "published" | "archived";

function publicUrl(bucket: string, path: string | null) {
  if (!path) return null;
  if (bucket === "external" || /^(https?:)?\/\//.test(path)) {
    return path;
  }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function statusPill(status: string) {
  if (status === "published") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "archived") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LibraryClient({
  currentUserId,
  currentUserLabel,
  initialPhotos,
  categories,
  photographers,
}: {
  currentUserId: string;
  currentUserLabel: string;
  initialPhotos: Photo[];
  categories: Category[];
  photographers: Photographer[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(initialPhotos[0]?.id ?? null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState(categories[0]?.slug ?? "wildlife");
  const [uploadPhotographer, setUploadPhotographer] = useState(currentUserId);
  const [uploadStatus, setUploadStatus] = useState<"draft" | "published">("draft");
  const [uploadWatermarkAsset, setUploadWatermarkAsset] = useState<WatermarkAsset>("logo_black");
  const [uploadWatermarkPosition, setUploadWatermarkPosition] =
    useState<WatermarkPosition>("bottom-right");
  const [uploadWatermarkScale, setUploadWatermarkScale] = useState(18);

  const [editTitle, setEditTitle] = useState(initialPhotos[0]?.title ?? "");
  const [editCategory, setEditCategory] = useState(initialPhotos[0]?.category_slug ?? categories[0]?.slug ?? "");
  const [editPhotographer, setEditPhotographer] = useState(initialPhotos[0]?.photographer_id ?? currentUserId);
  const [editStatus, setEditStatus] = useState<"draft" | "published" | "archived">(
    (initialPhotos[0]?.status as "draft" | "published" | "archived" | undefined) ?? "draft"
  );
  const [editWatermarkAsset, setEditWatermarkAsset] = useState<WatermarkAsset>("logo_black");
  const [editWatermarkPosition, setEditWatermarkPosition] =
    useState<WatermarkPosition>("bottom-right");
  const [editWatermarkScale, setEditWatermarkScale] = useState(18);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  useEffect(() => {
    if (!photos.length) {
      setSelectedId(null);
      return;
    }

    if (selectedId && photos.some((photo) => photo.id === selectedId)) {
      return;
    }

    const nextSelected = photos[0];
    setSelectedId(nextSelected.id);
    syncEditor(nextSelected);
  }, [photos, selectedId]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const statusMatches = statusFilter === "all" || photo.status === statusFilter;
      const categoryMatches = categoryFilter === "all" || photo.category_slug === categoryFilter;
      return statusMatches && categoryMatches;
    });
  }, [categoryFilter, photos, statusFilter]);

  const selectedPhoto = useMemo(
    () =>
      filteredPhotos.find((photo) => photo.id === selectedId) ??
      photos.find((photo) => photo.id === selectedId) ??
      null,
    [filteredPhotos, photos, selectedId]
  );

  function syncEditor(photo: Photo | null) {
    if (!photo) return;
    setEditTitle(photo.title);
    setEditCategory(photo.category_slug);
    setEditPhotographer(photo.photographer_id ?? currentUserId);
    setEditStatus(photo.status as "draft" | "published" | "archived");
    setEditWatermarkAsset("logo_black");
    setEditWatermarkPosition("bottom-right");
    setEditWatermarkScale(18);
  }

  function upsertPhoto(nextPhoto: Photo) {
    setPhotos((current) => {
      const remaining = current.filter((photo) => photo.id !== nextPhoto.id);
      return [nextPhoto, ...remaining].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  }

  async function refresh() {
    router.refresh();
  }

  async function sourceBlobForPhoto(photo: Photo) {
    if (photo.original_path && photo.original_bucket !== "external") {
      const { data, error } = await supabase.storage.from(photo.original_bucket).download(photo.original_path);

      if (error || !data) {
        throw new Error(error?.message || "Could not download original image.");
      }

      return data;
    }

    const sourceUrl = publicUrl(photo.original_bucket, photo.original_path || photo.display_path);

    if (!sourceUrl) {
      throw new Error("Could not resolve source image.");
    }

    const response = await fetch(sourceUrl);

    if (!response.ok) {
      throw new Error("Could not load source image.");
    }

    return await response.blob();
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
        createWatermarkedRendition({
          source: uploadFile,
          maxDimension: 2400,
          quality: 0.86,
          watermark: {
            asset: uploadWatermarkAsset,
            position: uploadWatermarkPosition,
            scalePercent: uploadWatermarkScale,
          },
        }),
        createWatermarkedRendition({
          source: uploadFile,
          maxDimension: 800,
          quality: 0.78,
          watermark: {
            asset: uploadWatermarkAsset,
            position: uploadWatermarkPosition,
            scalePercent: Math.max(uploadWatermarkScale + 10, Math.round(uploadWatermarkScale * 1.7)),
          },
          minimumWatermarkWidth: 180,
        }),
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

      const { data: insertedPhoto, error: insertError } = await supabase
        .from("photos")
        .insert({
          title: uploadTitle.trim(),
          alt_text: uploadTitle.trim(),
          caption: null,
          category_slug: uploadCategory,
          photographer_id: uploadPhotographer,
          created_by: currentUserId,
          updated_by: currentUserId,
          status: uploadStatus,
          published_at: uploadStatus === "published" ? new Date().toISOString() : null,
          display_path: displayPath,
          thumbnail_path: thumbPath,
          original_path: originalPath,
          original_size_bytes: uploadFile.size,
          display_size_bytes: displayBlob.size,
          thumbnail_size_bytes: thumbBlob.size,
          width,
          height,
        })
        .select("*")
        .single();

      if (insertError || !insertedPhoto) {
        throw new Error(insertError?.message || "Upload failed.");
      }

      setNotice("Photo uploaded.");
      setUploadFile(null);
      setUploadTitle("");
      upsertPhoto(insertedPhoto);
      setSelectedId(insertedPhoto.id);
      syncEditor(insertedPhoto);
      refresh();
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

    const { data: updatedPhoto, error: updateError } = await supabase
      .from("photos")
      .update({
        title: editTitle.trim(),
        alt_text: editTitle.trim(),
        caption: null,
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
      .eq("id", selectedPhoto.id)
      .select("*")
      .single();

    if (updateError || !updatedPhoto) {
      setError(updateError?.message || "Update failed.");
      setBusyAction(null);
      return;
    }

    setNotice("Photo updated.");
    upsertPhoto(updatedPhoto);
    syncEditor(updatedPhoto);
    refresh();
    setBusyAction(null);
  }

  async function archiveSelectedPhoto() {
    if (!selectedPhoto) return;

    setBusyAction("archive");
    setError(null);
    setNotice(null);

    const { data: updatedPhoto, error: updateError } = await supabase
      .from("photos")
      .update({
        status: "archived",
        published_at: null,
        updated_by: currentUserId,
      })
      .eq("id", selectedPhoto.id)
      .select("*")
      .single();

    if (updateError || !updatedPhoto) {
      setError(updateError?.message || "Archive failed.");
      setBusyAction(null);
      return;
    }

    setNotice("Photo archived.");
    upsertPhoto(updatedPhoto);
    syncEditor(updatedPhoto);
    refresh();
    setBusyAction(null);
  }

  async function rebuildSelectedWatermark() {
    if (!selectedPhoto) return;

    setBusyAction("watermark");
    setError(null);
    setNotice(null);

    try {
      const sourceBlob = await sourceBlobForPhoto(selectedPhoto);
      const [{ blob: displayBlob, width, height }, { blob: thumbBlob }] = await Promise.all([
        createWatermarkedRendition({
          source: sourceBlob,
          maxDimension: 2400,
          quality: 0.86,
          watermark: {
            asset: editWatermarkAsset,
            position: editWatermarkPosition,
            scalePercent: editWatermarkScale,
          },
        }),
        createWatermarkedRendition({
          source: sourceBlob,
          maxDimension: 800,
          quality: 0.78,
          watermark: {
            asset: editWatermarkAsset,
            position: editWatermarkPosition,
            scalePercent: Math.max(editWatermarkScale + 10, Math.round(editWatermarkScale * 1.7)),
          },
          minimumWatermarkWidth: 180,
        }),
      ]);

      const version = Date.now();
      const displayPath = `${selectedPhoto.photographer_id ?? currentUserId}/${selectedPhoto.id}-watermarked-${version}.jpg`;
      const thumbPath = `${selectedPhoto.photographer_id ?? currentUserId}/${selectedPhoto.id}-watermarked-thumb-${version}.jpg`;

      const [{ error: displayError }, { error: thumbError }] = await Promise.all([
        supabase.storage.from("photo-display").upload(displayPath, displayBlob, {
          contentType: "image/jpeg",
          upsert: true,
        }),
        supabase.storage.from("photo-thumbs").upload(thumbPath, thumbBlob, {
          contentType: "image/jpeg",
          upsert: true,
        }),
      ]);

      if (displayError || thumbError) {
        throw new Error(displayError?.message || thumbError?.message);
      }

      const { data: updatedPhoto, error: updateError } = await supabase
        .from("photos")
        .update({
          display_bucket: "photo-display",
          display_path: displayPath,
          display_size_bytes: displayBlob.size,
          thumbnail_bucket: "photo-thumbs",
          thumbnail_path: thumbPath,
          thumbnail_size_bytes: thumbBlob.size,
          width,
          height,
          updated_by: currentUserId,
        })
        .eq("id", selectedPhoto.id)
        .select("*")
        .single();

      if (updateError || !updatedPhoto) {
        throw new Error(updateError?.message || "Watermark rebuild failed.");
      }

      setNotice("Public images rebuilt with watermark.");
      upsertPhoto(updatedPhoto);
      syncEditor(updatedPhoto);
      refresh();
    } catch (rebuildError) {
      setError(rebuildError instanceof Error ? rebuildError.message : "Watermark rebuild failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteSelectedPhoto() {
    if (!selectedPhoto) return;
    if (!window.confirm("Delete this photo and its stored files permanently?")) return;

    setBusyAction("delete");
    setError(null);
    setNotice(null);

    const removals: Promise<unknown>[] = [];

    if (selectedPhoto.original_path && selectedPhoto.original_bucket !== "external") {
      removals.push(supabase.storage.from(selectedPhoto.original_bucket).remove([selectedPhoto.original_path]));
    }

    if (selectedPhoto.display_bucket !== "external") {
      removals.push(supabase.storage.from(selectedPhoto.display_bucket).remove([selectedPhoto.display_path]));
    }

    if (selectedPhoto.thumbnail_path && selectedPhoto.thumbnail_bucket !== "external") {
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
    setPhotos((current) => current.filter((photo) => photo.id !== selectedPhoto.id));
    setSelectedId(null);
    refresh();
    setBusyAction(null);
  }

  const draftCount = photos.filter((photo) => photo.status === "draft").length;
  const publishedCount = photos.filter((photo) => photo.status === "published").length;
  const archivedCount = photos.filter((photo) => photo.status === "archived").length;

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
                <p className="mt-4 text-3xl font-semibold">{photos.length}</p>
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
            <p className="text-sm text-[color:var(--color-muted)]">Signed in as {currentUserLabel}</p>
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px] xl:items-start">
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
                const aspectRatio =
                  photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 3";

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
                    <div
                      className="overflow-hidden bg-[color:var(--color-panel)]"
                      style={{ aspectRatio }}
                    >
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={preview}
                          alt={photo.alt_text ?? photo.title}
                          className="h-full w-full object-contain"
                        />
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

          <div className="space-y-4 xl:sticky xl:top-24">
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
                <label className="block cursor-pointer rounded-[1.6rem] border border-dashed bg-[color:var(--color-surface)] p-5 transition hover:border-[color:var(--color-accent)] hover:bg-white">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                    Choose photo
                  </p>
                  <p className="mt-3 text-sm text-[color:var(--color-ink)]">
                    {uploadFile ? uploadFile.name : "Click here to browse your files"}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--color-muted)]">
                    JPG, PNG, or WebP. The portal keeps the original and creates web and thumbnail versions automatically.
                  </p>
                </label>

                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(event) => setUploadTitle(event.target.value)}
                  placeholder="Title"
                  className="w-full rounded-2xl border bg-[color:var(--color-surface)] px-4 py-3 text-sm"
                  required
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

                <div className="rounded-[1.5rem] border bg-[color:var(--color-surface)] p-4">
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                    Watermark
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <select
                      value={uploadWatermarkAsset}
                      onChange={(event) => setUploadWatermarkAsset(event.target.value as WatermarkAsset)}
                      className="rounded-2xl border bg-white px-4 py-3 text-sm"
                    >
                      {WATERMARK_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={uploadWatermarkPosition}
                      onChange={(event) =>
                        setUploadWatermarkPosition(event.target.value as WatermarkPosition)
                      }
                      className="rounded-2xl border bg-white px-4 py-3 text-sm"
                    >
                      {WATERMARK_POSITIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3">
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                      Size {uploadWatermarkScale}%
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="30"
                      step="1"
                      value={uploadWatermarkScale}
                      onChange={(event) => setUploadWatermarkScale(Number(event.target.value))}
                      className="w-full"
                    />
                  </div>
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
                        className="max-h-[360px] w-full object-contain"
                      />
                    ) : null}
                  </div>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
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

                  <div className="rounded-[1.5rem] border bg-[color:var(--color-surface)] p-4">
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                      Watermark
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <select
                        value={editWatermarkAsset}
                        onChange={(event) => setEditWatermarkAsset(event.target.value as WatermarkAsset)}
                        className="rounded-2xl border bg-white px-4 py-3 text-sm"
                      >
                        {WATERMARK_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editWatermarkPosition}
                        onChange={(event) =>
                          setEditWatermarkPosition(event.target.value as WatermarkPosition)
                        }
                        className="rounded-2xl border bg-white px-4 py-3 text-sm"
                      >
                        {WATERMARK_POSITIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3">
                      <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                        Size {editWatermarkScale}%
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="30"
                        step="1"
                        value={editWatermarkScale}
                        onChange={(event) => setEditWatermarkScale(Number(event.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                      onClick={rebuildSelectedWatermark}
                      disabled={busyAction === "watermark"}
                      className="cursor-pointer rounded-2xl border border-black/15 bg-[color:var(--color-surface)] px-4 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === "watermark" ? "Baking..." : "Bake watermark"}
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
                  <div className="rounded-[1.4rem] border bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-muted)]">
                    {`Original ${formatBytes(selectedPhoto.original_size_bytes)}`}
                    {" · "}
                    {`Web ${formatBytes(selectedPhoto.display_size_bytes)}`}
                    {" · "}
                    {`Thumb ${formatBytes(selectedPhoto.thumbnail_size_bytes)}`}
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
