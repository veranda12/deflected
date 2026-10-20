import Link from "next/link";
import { IconArrow } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import type { CategoryView, ProductView, ProjectView } from "@/lib/queries";
import { cn, pad2 } from "@/lib/utils";

export function CategoryCard({
  category,
  index,
  className,
  sizes,
  tall,
}: {
  category: CategoryView;
  index: number;
  className?: string;
  sizes: string;
  tall?: boolean;
}) {
  return (
    <Link
      href={`/katalog/kategori/${category.slug}`}
      className={cn("group relative isolate block overflow-hidden rounded-lg bg-ink text-white cut-corner", className)}
      style={{ ["--cut" as string]: tall ? "56px" : "36px" }}
    >
      <div className="zoom-media absolute inset-0 -z-10">
        <MediaImage img={category.cover} sizes={sizes} alt="" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,17,40,0)_35%,rgba(10,17,40,0.88)_100%)]" />
      <div className="flex h-full flex-col justify-end p-5 sm:p-7">
        <span className="font-display text-2xl leading-none text-amber">{pad2(index + 1)}</span>
        <h3 className={cn("mt-2 font-display leading-[0.92]", tall ? "text-[clamp(2.4rem,4vw,3.6rem)]" : "text-[clamp(1.9rem,2.8vw,2.6rem)]")}>
          {category.name}
        </h3>
        <p className="mt-2 max-w-sm text-[0.92rem] leading-snug text-white/85">{category.tagline}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[0.85rem] font-semibold">
          {category.productCount} produk
          <IconArrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function ProductCard({ product, sizes, priority }: { product: ProductView; sizes: string; priority?: boolean }) {
  const [first, second] = product.images;
  return (
    <Link href={`/produk/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-cloud cut-corner-sm">
        <div className="zoom-media absolute inset-0">
          <MediaImage img={first} sizes={sizes} priority={priority} />
        </div>
        {second && (
          // Second photo crossfades in on hover: shows another production example of the same product.
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <MediaImage img={second} sizes={sizes} />
          </div>
        )}
        {product.images.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-xs bg-white/95 px-2 py-1 text-[0.72rem] font-semibold text-ink">
            {product.images.length} foto
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.78rem] font-semibold text-blue-strong">{product.category?.name}</p>
          <h3 className="mt-1 text-[1.05rem] leading-snug font-semibold text-ink group-hover:underline group-hover:decoration-blue group-hover:decoration-2 group-hover:underline-offset-4">
            {product.name}
          </h3>
          {product.materials.length > 0 && (
            <p className="mt-1 line-clamp-1 text-[0.86rem] text-text-2">{product.materials.join(", ")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProjectCard({
  project,
  sizes,
  aspect = "aspect-[4/5]",
  className,
}: {
  project: ProjectView;
  sizes: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <Link href={`/portofolio/${project.slug}`} className={cn("group block", className)}>
      <div className={cn("relative overflow-hidden rounded-md bg-cloud", aspect)}>
        <div className="zoom-media absolute inset-0">
          <MediaImage img={project.images[0]} sizes={sizes} />
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/92 px-4 py-3 text-[0.82rem] text-white transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-y-0 group-focus-visible:translate-y-0">
          {[...project.materials, ...project.techniques].join(" · ")}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-[1rem] font-semibold text-ink">{project.title}</h3>
        <p className="mt-0.5 text-[0.86rem] text-text-2">{project.productLabel}</p>
      </div>
    </Link>
  );
}
