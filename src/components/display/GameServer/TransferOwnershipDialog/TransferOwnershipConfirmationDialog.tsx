import { Button } from "@components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { useState } from "react";
import type { GameServerDto, TransferOwnershipDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const TransferOwnershipAlertDialog = (props: {
  gameServer: GameServerDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newOwnerName: string;
}) => {
  const { t } = useTranslationPrefix("components.editGameServer.uncosyZone.transferOwnership.confirmationDialog");
  const { transferOwnership } = useDataInteractions();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const dto: TransferOwnershipDto = {
        new_owner_name: props.newOwnerName,
      };
      console.log(dto);
      await transferOwnership(props.gameServer.uuid, dto);
      props.onOpenChange(false);
    } catch (_e) {
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (loading) return; // Prevent closing while loading
    props.onOpenChange(newOpen);
    if (!newOpen) { }
  };

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <DialogMain>
          <p className="text-base leading-6">{t("description")}</p>
          <p className="text-base">{t("newOwner")}</p>
          <p className="font-bold text-base">{props.newOwnerName}</p>
        </DialogMain>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="" variant="secondary" disabled={loading}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={"destructive"}
            onClick={handleConfirm}
            className=""
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferOwnershipAlertDialog;
