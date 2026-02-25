import { cn } from "@/lib/utils.ts";

type Variant = "primary" | "secondary" | "foreground";

const variantClass: Record<Variant, string> = {
  primary: "text-icon-primary",
  secondary: "text-secondary",
  foreground: "text-icon-foreground",
};

type IconProps = {
  src: string;
  alt?: string;
  className?: string;
  variant?: Variant;
  viewBox?: string;
  bold?: boolean | "sm";
};

const Icon = ({ src, alt = "", className, variant = "primary", viewBox = "0 0 16 16", bold = false }: IconProps) => {
  const innerHtml = src
    .replace(/fill="#FFFFFF"/gi, 'fill="currentColor"')
    .replace(/^[\s\S]*<svg[^>]*>([\s\S]*)<\/svg>[\s\S]*$/, "$1");

  return (
    <svg
      viewBox={viewBox}
      shapeRendering="crispEdges"
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn(
        "size-7 shrink-0 [image-rendering:pixelated]",
        bold === "sm" && "[filter:drop-shadow(1px_0_0_currentColor)_drop-shadow(-1px_0_0_currentColor)]",
        bold === true && "[filter:drop-shadow(1px_0_0_currentColor)_drop-shadow(-1px_0_0_currentColor)_drop-shadow(0_1px_0_currentColor)_drop-shadow(0_-1px_0_currentColor)]",
        variantClass[variant],
        className,
      )}
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    />
  );
};

export default Icon;
