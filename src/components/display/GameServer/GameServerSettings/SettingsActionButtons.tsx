import { Button } from "@components/ui/button.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface SettingsActionButtonsProps {
  onRevert: () => void;
  onConfirm: () => void;
  revertDisabled: boolean;
  confirmDisabled: boolean;
  errorMessage?: string | null;
  confirmTooltip?: string | false;
  children?: React.ReactNode;
}

const SettingsActionButtons = ({
  onRevert,
  onConfirm,
  revertDisabled,
  confirmDisabled,
  errorMessage,
  confirmTooltip,
  children,
}: SettingsActionButtonsProps) => {
  const { t } = useTranslationPrefix("components.settingsActionButtons");

  return (
    <>
      <div className="sticky bottom-4 w-fit ml-auto flex items-center gap-4 mr-5 mt-auto">
        {errorMessage && <p className="text-base text-destructive">{errorMessage}</p>}
        <Button className="h-12.5" variant="secondary" disabled={revertDisabled} onClick={onRevert}>
          {t("revert")}
        </Button>
        <TooltipWrapper tooltip={confirmTooltip}>
          <Button className="h-12.5" disabled={confirmDisabled} onClick={onConfirm}>
            {t("confirm")}
          </Button>
        </TooltipWrapper>
      </div>
      {children}
    </>
  );
};

export default SettingsActionButtons;
