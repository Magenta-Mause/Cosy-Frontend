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
import { ArrowLeft, UserRoundPlus } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { UserEntityDtoRole } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { InviteForm } from "./InviteForm/InviteForm.tsx";
import { InviteResult } from "./InviteForm/InviteResult.tsx";

type ViewState = "invite" | "result";

const UserModalButton = (props: { className?: string }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewState>("invite");
  const [inviteUsername, setInviteUsername] = useState("");
  const [userRole, setUserRole] = useState<UserEntityDtoRole>("QUOTA_USER");
  const [memoryLimit, setMemoryLimit] = useState<number | null>(null);
  const [cpuLimit, setCpuLimit] = useState<number | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { createInvite, revokeInvite } = useDataInteractions();

  const handleCreateInvite = async () => {
    setIsCreating(true);
    const roundedCpuLimit = cpuLimit ? Math.round(cpuLimit * 1000) : null;

    try {
      const data = await createInvite({
        username: inviteUsername || undefined,
        role: userRole,
        max_memory: memoryLimit || undefined,
        max_cpu: roundedCpuLimit || undefined,
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
    setView("invite");
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
        <Button className={props.className} aria-label={t("userModal.title")}>
          <UserRoundPlus className="size-6 mr-2" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[40%]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {view === "invite" && t("userModal.inviteUserTitle")}
            {view === "result" && t("userModal.inviteCreatedTitle")}
          </DialogTitle>
        </DialogHeader>
        <DialogMain>
          {view === "invite" && (
            <InviteForm
              username={inviteUsername}
              userRole={userRole}
              memory={memoryLimit}
              cpu={cpuLimit}
              onUsernameChange={setInviteUsername}
              onMemoryChange={setMemoryLimit}
              onCpuChange={setCpuLimit}
              onCancel={() => setView("invite")}
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
          {view === "invite" && (
            <>
              <Button size="sm" onClick={() => setView("invite")} variant="secondary">
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
