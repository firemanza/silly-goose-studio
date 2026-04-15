export type WatermarkAsset =
  | "logo_black"
  | "logo_inverse_black"
  | "logo_inverse_white"
  | "logo_white";

export type WatermarkPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface WatermarkSettings {
  asset: WatermarkAsset;
  position: WatermarkPosition;
  scalePercent: number;
}

export const WATERMARK_OPTIONS: { value: WatermarkAsset; label: string; src: string }[] = [
  { value: "logo_black", label: "Black", src: "/watermarks/logo_black.PNG" },
  {
    value: "logo_inverse_black",
    label: "Inverse Black",
    src: "/watermarks/logo_inverse_black.PNG",
  },
  {
    value: "logo_inverse_white",
    label: "Inverse White",
    src: "/watermarks/logo_inverse_white.PNG",
  },
  { value: "logo_white", label: "White", src: "/watermarks/logo_white.PNG" },
];

export const WATERMARK_POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

function imageFromUrl(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
}

function imageFromBlob(blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };
    image.src = objectUrl;
  });
}

function drawWatermark(
  context: CanvasRenderingContext2D,
  watermark: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  settings: WatermarkSettings
) {
  const longestSide = Math.max(canvasWidth, canvasHeight);
  const targetWidth = Math.max(120, Math.round(canvasWidth * (settings.scalePercent / 100)));
  const ratio = targetWidth / watermark.width;
  const watermarkWidth = Math.round(watermark.width * ratio);
  const watermarkHeight = Math.round(watermark.height * ratio);
  const padding = Math.max(18, Math.round(longestSide * 0.028));

  let x = padding;
  let y = padding;

  if (settings.position.endsWith("right")) {
    x = canvasWidth - watermarkWidth - padding;
  }

  if (settings.position.startsWith("bottom")) {
    y = canvasHeight - watermarkHeight - padding;
  }

  context.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);
}

export async function createWatermarkedRendition({
  source,
  maxDimension,
  quality,
  watermark,
}: {
  source: Blob;
  maxDimension: number;
  quality: number;
  watermark: WatermarkSettings;
}) {
  const [image, watermarkImage] = await Promise.all([
    imageFromBlob(source),
    imageFromUrl(WATERMARK_OPTIONS.find((option) => option.value === watermark.asset)?.src ?? WATERMARK_OPTIONS[0].src),
  ]);

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
  drawWatermark(context, watermarkImage, width, height, watermark);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) {
    throw new Error("Could not generate watermarked image");
  }

  return { blob, width, height };
}
