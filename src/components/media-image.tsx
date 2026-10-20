import Image from "next/image";
import type { Img } from "@/lib/queries";
import { mediaUrl } from "@/lib/storage-url";
import { cn } from "@/lib/utils";

type Props = {
  img: Img | null | undefined;
  sizes: string;
  className?: string;
  priority?: boolean;
  alt?: string;
  fill?: boolean;
};

/** next/image wrapper for media records. Uses fill by default so the frame controls aspect ratio (no CLS). */
export function MediaImage({ img, sizes, className, priority, alt, fill = true }: Props) {
  if (!img) {
    return <div className={cn("absolute inset-0 bg-cloud", className)} aria-hidden />;
  }
  const src = mediaUrl(img.key);
  if (fill || !img.width || !img.height) {
    return <Image src={src} alt={alt ?? img.alt} fill sizes={sizes} loading={priority ? "eager" : undefined} fetchPriority={priority ? "high" : undefined} className={cn("object-cover", className)} />;
  }
  return <Image src={src} alt={alt ?? img.alt} width={img.width} height={img.height} sizes={sizes} loading={priority ? "eager" : undefined} fetchPriority={priority ? "high" : undefined} className={className} />;
}
