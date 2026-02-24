import { Button } from "@components/ui/button.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { Link } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InviteResultProps {
  generatedKey: string | null;
  onCopyLink: () => void;
  onBack: () => void;
}

export const InviteResult = ({ generatedKey, onCopyLink }: InviteResultProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <TooltipWrapper tooltip={t("userModal.copyTooltip")} asChild>
          <Button
            onClick={onCopyLink}
            onKeyDown={(e) => {
              (e.key === "Enter" || e.key === "Space") && onCopyLink();
            }}
            variant="secondary"
            className="outline-dashed outline-button-primary-default border-none h-[16vh] col-span-3 flex items-center justify-center shadow-none bg-background/35 px-5 leading-none gap-5"
          >
            <Link className="size-10 shrink-0" />
            <div className="flex items-center wrap-anywhere text-wrap w-[60%]">
              {generatedKey ? `${window.location.origin}/?inviteToken=${generatedKey}` : ""}
            </div>
          </Button>
        </TooltipWrapper>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        {t("userModal.shareInstructions")}
      </p>
    </div>
  );
};
