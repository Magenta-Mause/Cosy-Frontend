import { cn } from "@/lib/utils.ts";

type Variant = "primary" | "secondary" | "foreground";

const variantClass: Record<Variant, string> = {
  primary: "text-icon-primary",
  secondary: "text-secondary",
  foreground: "text-foreground",
};

type IconProps = {
  src: string;
  alt?: string;
  className?: string;
  variant?: Variant;
};

const Icon = ({ src, alt = "", className, variant = "primary" }: IconProps) => {
  const innerHtml = src
    .replace(/fill="#FFFFFF"/gi, 'fill="currentColor"')
    .replace(/^[\s\S]*<svg[^>]*>([\s\S]*)<\/svg>[\s\S]*$/, "$1");

  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("size-7 shrink-0 [image-rendering:pixelated]", variantClass[variant], className)}
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    />
  );
};

export default Icon;
