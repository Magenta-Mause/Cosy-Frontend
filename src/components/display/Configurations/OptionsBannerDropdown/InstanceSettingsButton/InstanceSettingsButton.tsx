import CosyInstanceSettingsModal from "@components/display/CosyInstanceSettings/CosyInstanceSettingsModal.tsx";
import { Button } from "@components/ui/button.tsx";
import Icon from "@components/ui/Icon.tsx";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import settingsIcon from "@/assets/icons/settings.webp";
import { cn } from "@/lib/utils.ts";

type InstanceSettingsButtonProps = ComponentProps<typeof Button>;

const InstanceSettingsButton = forwardRef<HTMLButtonElement, InstanceSettingsButtonProps>(
  ({ onClick, ...props }, ref) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { t } = useTranslation();

    return (
      <>
        <Button
          {...props}
          ref={ref}
          onClick={(event) => {
            onClick?.(event);
            setIsSettingsOpen((prev) => !prev);
          }}
          className={cn("h-auto aspect-square", props.className)}
          aria-label={t("optionsBanner.instanceSettings")}
        >
          <Icon src={settingsIcon} />
        </Button>
        <CosyInstanceSettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </>
    );
  },
);

InstanceSettingsButton.displayName = "InstanceSettingsButton";

export default InstanceSettingsButton;
