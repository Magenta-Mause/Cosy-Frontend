import {isValidElement, useEffect, useMemo, useState} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {cn} from "@/lib/utils";

// ✅ allow ReactNode for flexibility
interface PixelIconProps {
  icon: React.ReactNode;
  resolution?: number;
  className?: string;
}

const PixelIcon = ({ icon, resolution = 32, className }: PixelIconProps) => {
  // Convert icon to static SVG only if it’s a valid React element
  const svgMarkup = useMemo(() => {
    if (!icon || !isValidElement(icon)) return "";
    return renderToStaticMarkup(icon);
  }, [icon]);

  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!svgMarkup) {
      setMaskUrl(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0, resolution, resolution);
      setMaskUrl(`url("${canvas.toDataURL()}")`);
      URL.revokeObjectURL(url);
    };

    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [svgMarkup, resolution]);

  if (!maskUrl) return <span className={cn("inline-block shrink-0", className)} />;

  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        maskImage: maskUrl,
        maskRepeat: "no-repeat",
        maskSize: "contain",
        maskPosition: "center",
        WebkitMaskImage: maskUrl,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        WebkitMaskPosition: "center",
        imageRendering: "pixelated",
      }}
    />
  );
};

export default PixelIcon;
