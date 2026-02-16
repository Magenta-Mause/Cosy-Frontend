import type { ComponentProps } from "react";
import { cn } from "@/lib/utils.ts";

const AccessGroupButton = (props: ComponentProps<"button"> & { isSelected?: boolean }) => {
  const { isSelected, ...rest } = props;
  return (
    <button
      {...rest}
      type={"button"}
      className={cn(
        "flex align-middle items-center gap-1 bg-primary p-1.5 rounded-xl transition-all",
        isSelected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        props.className,
      )}
    />
  );
};

export default AccessGroupButton;
