import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import type { VariantProps } from "class-variance-authority";

interface CopyButtonProps
  extends VariantProps<typeof buttonVariants> {
  value: string;
  tooltip?: string;
  copiedTooltip?: string;
  className?: string;
  disabled?: boolean;
}

const CopyButton = ({ value, tooltip, copiedTooltip, variant = "ghost", size = "icon", className, disabled = false }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current){
        clearTimeout(timerRef.current)
      }
    }
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 5000);
    } catch (error) {
      // Provide feedback and a manual-copy fallback if the clipboard write fails
      // (for example, in insecure contexts or when permissions are denied).
      // eslint-disable-next-line no-console
      console.error("Failed to copy to clipboard:", error);
      if (typeof window !== "undefined") {
        window.prompt("Copy to clipboard: Press Ctrl+C, then Enter", value);
      }
    }
  }, [value]);

  const activeTooltip = copied ? (copiedTooltip ?? tooltip) : tooltip;

  const button = (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={activeTooltip}
      className={className}
      disabled={copied || disabled}
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="text-green-500" />
      ) : (
        <Copy />
      )}
    </Button>
  );

  if (activeTooltip) {
    return <TooltipWrapper tooltip={activeTooltip}>{button}</TooltipWrapper>;
  }

  return button;
};

export default CopyButton;
