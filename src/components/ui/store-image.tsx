import Image, { type ImageProps } from "next/image";
import { isStorePhoto, sharpStoreImage } from "@/lib/images/sharp-store";

/**
 * Store photos must skip Next/Vercel AVIF recompression — it was crushing
 * detail to ~80KB and making heroes look soft/pixelated.
 */
export function StoreImage({
  src,
  alt,
  sharpen = true,
  unoptimized,
  quality,
  ...props
}: Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  sharpen?: boolean;
}) {
  const resolved = sharpen ? sharpStoreImage(src, src) : src;
  const skipOptimize = isStorePhoto(resolved);

  return (
    <Image
      {...props}
      src={resolved}
      alt={alt}
      unoptimized={skipOptimize || Boolean(unoptimized)}
      quality={quality ?? 95}
    />
  );
}
