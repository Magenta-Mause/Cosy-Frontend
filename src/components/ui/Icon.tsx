import * as React from "react";
import { cn } from "@/lib/utils.ts";

type Variant = "primary" | "secondary" | "foreground";

const variantClass: Record<Variant, string> = {
  primary: "text-icon-primary",
  secondary: "text-icon-foreground",
  foreground: "text-icon-foreground",
};

type IconProps = {
  src: string;
  alt?: string;
  className?: string;
  variant?: Variant;
  bold?: boolean | "sm";
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

const Icon = ({ src, alt = "", className, variant = "primary", bold = false, style, ...rest }: IconProps) => {
  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      style={{
        maskImage: `url("${src}")`,
        maskRepeat: "no-repeat",
        maskSize: "contain",
        maskPosition: "center",
        maskMode: "alpha",
        WebkitMaskImage: `url("${src}")`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        WebkitMaskPosition: "center",
        imageRendering: "pixelated",
        ...style,
      }}
      className={cn(
        "inline-block size-7 shrink-0 pointer-events-none bg-current",
        bold === "sm" && "filter-[drop-shadow(1px_0_0_currentColor)_drop-shadow(-1px_0_0_currentColor)]",
        bold === true && "filter-[drop-shadow(1px_0_0_currentColor)_drop-shadow(-1px_0_0_currentColor)_drop-shadow(0_1px_0_currentColor)_drop-shadow(0_-1px_0_currentColor)]",
        variantClass[variant],
        className,
      )}
      {...rest}
    />
  );
}

export default Icon;
