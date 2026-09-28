/**
 * Re-encodes a photo in the browser before upload: fixes rotation, shrinks it
 * to at most `maxSide` px, and drops all metadata (including GPS location),
 * because only the pixels are drawn to the canvas.
 */
export async function prepareImage(file: File, maxSide = 2000) {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      `Can't read "${file.name}". If it's a HEIC photo, export it as JPEG first.`,
    );
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));

  // Some browsers can't encode WebP and silently return PNG; use JPEG then.
  let blob = await toBlob("image/webp");
  let ext: "webp" | "jpg" = "webp";
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob("image/jpeg");
    ext = "jpg";
  }
  if (!blob) throw new Error("Couldn't compress this image.");

  return { blob, ext, width, height };
}
