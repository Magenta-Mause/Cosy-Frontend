import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base Styles: Converted gap, font-size, icon sizes, and focus rings to [vw]
  "inline-flex items-center font-['VT323'] text-xl justify-center gap-[0.5vw] whitespace-nowrap font-medium transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1vw] shrink-0 [&_svg]:shrink-0 aria-invalid:ring-destructive/20 aria-invalid:border-destructive text-primary-modal-background rounded-[5]",
  {
    variants: {
      variant: {
        primary: [
          "bg-button-primary-default text-button-secondary-default drop-shadow-md drop-shadow-button-drop-shadow outline-none",
          "hover:bg-button-primary-hover",
          "active:bg-button-primary-click active:shadow-[inset_0_4px_7px_calc(5px-0.2vw)_var(--color-button-primary-inner-shadow)] active:drop-shadow-none outline-0",
          "disabled:bg-button-primary-disabled disabled:text-button-secondary-disabled",
          "focus-visible:border-button-primary-hover outline-[0.2vw]"
        ],
        secondary: [
          "bg-button-secondary-default text-button-primary-click border-button-secondary-border border-[0.2vw] drop-shadow-md drop-shadow-button-drop-shadow",
          "hover:bg-button-secondary-hover",
          "active:bg-button-secondary-click active:shadow-[inset_0_4px_5px_0_var(--color-button-drop-shadow)] active:drop-shadow-none",
          "disabled:bg-button-secondary-disabled disabled:border-button-secondary-disabled-border disabled:text-button-secondary-disabled-border",
          "focus-visible:border-button-primary-hover"
        ],
        destructive: [
          "bg-button-destructive-default drop-shadow-md drop-shadow-button-drop-shadow text-button-destructive-text",
          "hover:bg-button-destructive-hover",
          "active:bg-button-destructive-click active:shadow-[inset_0_4px_5px_0_var(--color-button-primary-inner-shadow)] active:drop-shadow-none",
          "disabled:bg-button-destructive-disabled disabled:text-button-destructive-disabled-text",
          "focus-visible:border-button-destructive-click focus-visible:border-[0.2vw]"
        ],
      },
      size: {
        // Standard Sizes converted to vw
        default: "h-[2.5vw] px-[1vw] py-[0.5vw] has-[>svg]:px-[0.75vw]",
        sm: "h-[2.25vw] rounded-[0.3vw] gap-[0.35vw] px-[0.75vw] has-[>svg]:px-[0.6vw] text-lg",
        lg: "h-[2.75vw] rounded-[0.4vw] px-[1.5vw] has-[>svg]:px-[1vw] text-2xl",

        // Icons
        icon: "h-[2.25vw] w-[2.25vw]",
        "icon-sm": "h-[2vw] w-[2vw]",
        "icon-lg": "h-[2.5vw] w-[2.5vw]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
                  className,
                  variant,
                  size,
                  asChild = false,
                  ...props
                }: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {props.children}
      </Comp>
  );
}

export { Button, buttonVariants };
