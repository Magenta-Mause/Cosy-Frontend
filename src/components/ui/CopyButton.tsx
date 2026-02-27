import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import type { VariantProps } from "class-variance-authority";

interface CopyButtonProps
  extends VariantProps<typeof buttonVariants> {
  value: string;
  tooltip?: string;
  copiedTooltip?: string;
  className?: string;
}

const CopyButton = ({ value, tooltip, copiedTooltip, variant = "ghost", size = "icon", className }: CopyButtonProps) => {
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
    await navigator.clipboard.writeText(value);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 5000);
  }, [value]);

  const activeTooltip = copied ? (copiedTooltip ?? tooltip) : tooltip;

  const button = (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={copied}
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
