export type CanvasToFileOptions = {
  fileName?: string;
  type?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number;
};

export async function canvasToFile(
  canvas: HTMLCanvasElement,
  options: CanvasToFileOptions = {},
): Promise<File> {
  const {
    fileName = "avatar-cropped.png",
    type = "image/png",
    quality = 0.92,
  } = options;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

  if (!blob) {
    throw new Error("Nie udalo sie przygotowac przycietego obrazu.");
  }

  return new File([blob], fileName, { type });
}
