import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog.tsx";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { UserEntityDtoRole } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { cn } from "@/lib/utils.ts";
import { InviteForm } from "../UserInvite/InviteForm/InviteForm.tsx";
import { InviteResult } from "../UserInvite/InviteForm/InviteResult.tsx";
import { UserList } from "./UserList.tsx";

type ViewState = "list" | "invite" | "result";

const UserModalButton = (props: { className?: string }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewState>("list");
  const [inviteUsername, setInviteUsername] = useState("");
  const [userRole, setUserRole] = useState<UserEntityDtoRole>("QUOTA_USER");
  const [memoryLimit, setMemoryLimit] = useState<number | null>(null);
  const [coresLimit, setCoresLimit] = useState<number | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { createInvite, revokeInvite } = useDataInteractions();

  const handleCreateInvite = async () => {
    setIsCreating(true);
    try {
      const data = await createInvite({
        username: inviteUsername || undefined,
        role: userRole,
        max_memory: memoryLimit || undefined,
        max_cpu_cores: coresLimit || undefined,
      });
      setGeneratedKey(data.secret_key || "");
      setView("result");
    } catch (_e) {
      // Toast is handled in useDataInteractions
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedKey) {
      const link = `${window.location.origin}/?inviteToken=${generatedKey}`;
      navigator.clipboard.writeText(link);
      toast.success(t("toasts.copyClipboardSuccess"));
    }
  };

  const resetView = useCallback(() => {
    setView("list");
    setInviteUsername("");
    setGeneratedKey(null);
  }, []);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          resetView();
        }
        return !open;
      }}
    >
      <DialogTrigger asChild>
        <Button
          className={cn("h-auto p-[.5vw] aspect-square", props.className)}
          aria-label={t("userModal.title")}
        >
          <Users className="h-[1.5vw]! p-0 w-auto! aspect-square" />
        </Button>
      </DialogTrigger>
      <DialogContent className={"font-['VT323']"}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {view === "list" && t("userModal.title")}
            {view === "invite" && t("userModal.inviteUserTitle")}
            {view === "result" && t("userModal.inviteCreatedTitle")}
          </DialogTitle>
        </DialogHeader>
        <DialogMain>
          {view === "list" && <UserList onRevoke={revokeInvite} />}

          {view === "invite" && (
            <InviteForm
              username={inviteUsername}
              userRole={userRole}
              memory={memoryLimit}
              cores={coresLimit}
              onUsernameChange={setInviteUsername}
              onMemoryChange={setMemoryLimit}
              onCoresChange={setCoresLimit}
              onCancel={() => setView("list")}
              onSubmit={handleCreateInvite}
              onUserRoleChange={setUserRole}
              isCreating={isCreating}
            />
          )}

          {view === "result" && (
            <InviteResult
              generatedKey={generatedKey}
              onCopyLink={handleCopyLink}
              onBack={resetView}
            />
          )}
        </DialogMain>
        <DialogFooter>
          {view === "list" && (
            <Button size="sm" onClick={() => setView("invite")}>
              <UserPlus className="w-4 h-4 mr-2" />
              {t("userModal.inviteBtn")}
            </Button>
          )}
          {view === "invite" && (
            <>
              <Button size="sm" onClick={() => setView("list")} variant="secondary">
                {t("userModal.cancel")}
              </Button>
              <Button size="sm" onClick={handleCreateInvite} disabled={isCreating}>
                {isCreating ? t("userModal.creating") : t("userModal.generateInvite")}
              </Button>
            </>
          )}
          {view === "result" && (
            <Button size="sm" onClick={resetView} variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("userModal.backToUsers")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserModalButton;
