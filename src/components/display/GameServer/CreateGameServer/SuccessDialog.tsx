import HouseBuildingProcess from "@components/display/GameServer/CreateGameServer/HouseBuildingProcess.tsx";
import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { useTranslation } from "react-i18next";
import type { GameServerCreationFormState } from "./context.ts";

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  successInfo: { design: GameServerCreationFormState["design"]; serverName: string } | null;
}

const SuccessDialog = ({ open, onClose, successInfo }: SuccessDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col items-center gap-6 p-8">
        <DialogHeader className="items-center">
          <DialogTitle>{t("components.CreateGameServer.successDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("components.CreateGameServer.successDialog.description", {
              name: successInfo?.serverName,
            })}
          </DialogDescription>
        </DialogHeader>
        {successInfo && (
          <HouseBuildingProcess
            houseType={successInfo.design}
            currentStep={2}
            serverName={successInfo.serverName}
            stepLabel={t("components.CreateGameServer.successDialog.completedStepLabel")}
          />
        )}
        <DialogFooter>
          <Button variant="primary" onClick={onClose}>
            {t("components.CreateGameServer.successDialog.doneButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
