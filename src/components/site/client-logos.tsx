import { MediaImage } from "@/components/media-image";
import type { ClientView } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * Logo wall for client organisations. Every logo is limited to the same height
 * box, so wide wordmarks and square emblems read at a similar visual size.
 * Clients without a logo fall back to their name.
 */
export function ClientLogos({ clients, className }: { clients: ClientView[]; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 overflow-hidden rounded-md border-t border-l border-line bg-white sm:grid-cols-3 lg:grid-cols-4", className)}>
      {clients.map((c) => (
        <li key={c.id} className="relative flex h-24 items-center justify-center border-r border-b border-line p-5 sm:h-28">
          {c.logo ? (
            <MediaImage
              img={c.logo}
              alt={c.name}
              fill={false}
              sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
              className="h-auto max-h-14 w-auto max-w-[80%] object-contain sm:max-h-16"
            />
          ) : (
            <span className="text-center text-[0.95rem] font-semibold text-ink">{c.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
