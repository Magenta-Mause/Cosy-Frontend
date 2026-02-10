import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

interface TooltipWrapperProps {
  children?: ReactNode;
  tooltip: string | ReactNode;
  asChild?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerProps?: React.ComponentProps<typeof TooltipTrigger>;
}

const TooltipWrapper = ({
  children,
  tooltip,
  asChild = true,
  side,
  open,
  onOpenChange,
  triggerProps = {},
}: TooltipWrapperProps) => {
  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild={asChild} {...triggerProps}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>
        {typeof tooltip === 'string' ? <p>{tooltip}</p> : tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipWrapper;
