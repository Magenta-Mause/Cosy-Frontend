import type { ReactNode } from "react";
import {useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

interface PixelIconProps {
  icon: ReactNode;
  resolution?: number;
  className?: string;
}

const PixelIcon = ({ icon, resolution = 32, className }: PixelIconProps) => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    const svg = iconRef.current?.querySelector("svg");
    setSvgMarkup(svg?.outerHTML ?? null);
  }, [icon]);

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

    let cancelled = false;

    img.onload = () => {
      if (cancelled) return;
      ctx.drawImage(img, 0, 0, resolution, resolution);
      setMaskUrl(`url("${canvas.toDataURL()}")`);
      URL.revokeObjectURL(url);
    };

    img.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [svgMarkup, resolution]);

  return (
    <>
      <span ref={iconRef} className="absolute invisible pointer-events-none">
        {icon}
      </span>
      {maskUrl ? (
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
      ) : (
        <span className={cn("inline-block shrink-0", className)} />
      )}
    </>
  );
};

export default PixelIcon;
