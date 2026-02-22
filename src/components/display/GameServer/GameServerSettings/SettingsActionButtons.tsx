import { Button } from "@components/ui/button.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface SettingsActionButtonsProps {
  onRevert: () => void;
  onConfirm: () => void;
  revertDisabled: boolean;
  confirmDisabled: boolean;
  errorMessage?: string | null;
}

const SettingsActionButtons = ({
  onRevert,
  onConfirm,
  revertDisabled,
  confirmDisabled,
  errorMessage,
}: SettingsActionButtonsProps) => {
  const { t } = useTranslationPrefix("components.settingsActionButtons");

  return (
    <div className="sticky bottom-4 w-fit ml-auto flex items-center gap-4">
      {errorMessage && <p className="text-base text-destructive">{errorMessage}</p>}
      <Button className="h-12.5" variant="secondary" disabled={revertDisabled} onClick={onRevert}>
        {t("revert")}
      </Button>
      <Button className="h-12.5" disabled={confirmDisabled} onClick={onConfirm}>
        {t("confirm")}
      </Button>
    </div>
  );
};

export default SettingsActionButtons;
