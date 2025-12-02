import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface DeleteGameServerAlertDialogProps {
  serverName: string;
  onConfirm: () => void;
  children: React.ReactNode;
}

export function DeleteGameServerAlertDialog({
  serverName,
  onConfirm,
  children,
}: DeleteGameServerAlertDialogProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const isConfirmButtonDisabled = inputValue !== serverName;

  const handleConfirm = () => {
    if (inputValue === serverName) {
      onConfirm();
      setInputValue(""); // Clear input after confirmation
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setInputValue(""); // Clear input when dialog closes
    }
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className={"font-['VT323']"}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteGameServerDialog.title", { serverName })}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteGameServerDialog.description")}</AlertDialogDescription>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-start gap-4">
              <Label htmlFor="serverName" className="text-right">
                {t("deleteGameServerDialog.inputLabel")}
              </Label>
              <Input
                id="serverName"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={serverName}
                className="col-span-3"
              />
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className={"flex gap-8 justify-end items-center"}>
          <AlertDialogCancel className={"h-[50px]"}>
            {t("deleteGameServerDialog.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={"h-[50px]"}
            disabled={isConfirmButtonDisabled}
          >
            {t("deleteGameServerDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
