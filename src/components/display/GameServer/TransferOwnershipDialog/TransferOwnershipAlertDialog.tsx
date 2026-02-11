import { Button } from "@components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Dialog } from "@radix-ui/react-dialog";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import type { GameServerDto, TransferOwnershipDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const TransferOwnershipAlertDialog = (props: {
  gameServer: GameServerDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("components.editGameServer.transferOwnership");
  const { transferOwnership } = useDataInteractions();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const dto: TransferOwnershipDto = {
        new_owner_name: inputValue,
      };
      console.log(dto);
      await transferOwnership(props.gameServer.uuid, dto);
      setInputValue("");
      props.onOpenChange(false);
    } catch (_e) {
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (loading) return; // Prevent closing while loading
    props.onOpenChange(newOpen);
    if (!newOpen) {
      setInputValue(""); // Clear input when dialog closes
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <Input
            id="userName"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            disabled={loading}
          ></Input>
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
