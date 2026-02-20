import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip.tsx";

interface TooltipWrapperProps {
  children?: ReactNode;
  tooltip: string | ReactNode | false | null | undefined;
  asChild?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerProps?: React.ComponentProps<typeof TooltipTrigger>;
}

const TooltipWrapper = ({
  children,
  tooltip,
  asChild = true,
  side,
  align = "center",
  contentClassName,
  open,
  onOpenChange,
  triggerProps = {},
}: TooltipWrapperProps) => {
  // If tooltip is falsy, just return children without tooltip wrapper
  if (!tooltip) {
    return <>{children}</>;
  }

  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild={asChild} {...triggerProps}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align} className={contentClassName}>
        {typeof tooltip === "string" ? <p>{tooltip}</p> : tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipWrapper;
