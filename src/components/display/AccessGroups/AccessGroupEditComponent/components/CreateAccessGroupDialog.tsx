import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { Button } from "@components/ui/button.tsx";
import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import * as z from "zod";
import AccessGroupButton from "./AccessGroupButton";

const CreateAccessGroupDialog = (props: {
  onCreate: (groupName: string) => Promise<void>;
}) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      await props.onCreate(groupName.trim());
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (loading) return;
    setDialogOpen(open);
    if (!open) {
      setGroupName("");
    }
  };

  return (
    <>
      <AccessGroupButton onClick={() => setDialogOpen(true)}>
        <PlusIcon />
        <span>{t("createNewGroup")}</span>
      </AccessGroupButton>
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createNewGroup")}</DialogTitle>
            <DialogDescription>{t("createGroupDescription")}</DialogDescription>
          </DialogHeader>

          <InputFieldEditGameServer
            label={t("groupNameLabel")}
            value={groupName}
            onChange={(v) => setGroupName(v as string)}
            validator={z.string().min(1)}
            placeholder={t("groupNamePlaceholder")}
            errorLabel={t("groupNameRequired")}
            disabled={loading}
            onEnterPress={groupName.trim() ? handleCreate : undefined}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={loading}>
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button onClick={handleCreate} disabled={loading || !groupName.trim()}>
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAccessGroupDialog;
