const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

const extensionByMimeType: Record<(typeof imageMimeTypes)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const uploadLimits = {
  adImage: 5 * 1024 * 1024,
  businessImage: 5 * 1024 * 1024,
  categoryImage: 3 * 1024 * 1024,
} as const;

export function validateImageFile(file: File, maxSizeBytes: number) {
  if (!imageMimeTypes.includes(file.type as (typeof imageMimeTypes)[number])) {
    return {
      ok: false as const,
      message: "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP.",
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      ok: false as const,
      message: "حجم الصورة أكبر من الحد المسموح.",
    };
  }

  return {
    extension: extensionByMimeType[file.type as (typeof imageMimeTypes)[number]],
    ok: true as const,
  };
}

export function buildStoragePath(parts: string[], extension: string) {
  const safeParts = parts.map((part) => part.replace(/[^a-zA-Z0-9_-]/g, "-"));
  return `${safeParts.join("/")}/${crypto.randomUUID()}.${extension}`;
}
