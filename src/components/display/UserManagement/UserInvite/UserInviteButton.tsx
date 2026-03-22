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
import Icon from "@components/ui/Icon.tsx";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserEntityDtoRole } from "@/api/generated/model";
import addUserIcon from "@/assets/icons/userAdd.webp";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { notificationModal } from "@/lib/notificationModal";
import { getCpuLimitError } from "@/lib/validators/cpuLimitValidator.ts";
import { getMemoryLimitError } from "@/lib/validators/memoryLimitValidator.ts";
import { InviteForm } from "./InviteForm/InviteForm.tsx";
import { InviteResult } from "./InviteForm/InviteResult.tsx";

type ViewState = "invite" | "result";
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 50;

const UserInviteButton = (props: { className?: string }) => {
  const { t } = useTranslation();
  const { createInvite } = useDataInteractions();

  const [view, setView] = useState<ViewState>("invite");
  const [inviteUsername, setInviteUsername] = useState("");
  const [userRole, setUserRole] = useState<UserEntityDtoRole>("QUOTA_USER");
  const [memoryLimit, setMemoryLimit] = useState<string | null>(null);
  const [cpuLimit, setCpuLimit] = useState<number | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [cpuError, setCpuError] = useState<string | null>(null);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Restriction states
  const [allowGameServerCreation, setAllowGameServerCreation] = useState(true);
  const [mcRouterAllowAllDomains, setMcRouterAllowAllDomains] = useState(true);
  const [mcRouterAllowedDomains, setMcRouterAllowedDomains] = useState<string[]>([]);
  const [allowAllPorts, setAllowAllPorts] = useState(true);
  const [allowedPorts, setAllowedPorts] = useState<string[]>([]);

  const validateUsername = (username: string): string | null => {
    if (!username) return null;

    if (username.length < MIN_USERNAME_LENGTH) {
      return t("userModal.usernameErrors.tooShort");
    }

    if (username.length > MAX_USERNAME_LENGTH) {
      return t("userModal.usernameErrors.tooLong");
    }

    if (!/^[a-zA-Z0-9_-]*$/.test(username)) {
      return t("userModal.usernameErrors.invalidCharacters");
    }

    return null;
  };

  const handleUsernameChange = (value: string) => {
    setInviteUsername(value);
    const error = validateUsername(value);
    setUsernameError(error);
  };

  const handleCpuChange = (value: number | null) => {
    setCpuLimit(value);
    const error = getCpuLimitError(value);
    setCpuError(error);
  };

  const handleMemoryChange = (value: string | null) => {
    setMemoryLimit(value);
    const error = getMemoryLimitError(value);
    setMemoryError(error);
  };

  const handleCreateInvite = async () => {
    const error = validateUsername(inviteUsername);
    if (error) {
      setUsernameError(error);
      return;
    }

    // Don't submit if there are validation errors
    if (cpuError || memoryError) {
      return;
    }

    setIsCreating(true);

    try {
      const data = await createInvite({
        username: inviteUsername || undefined,
        role: userRole,
        docker_hardware_limits: {
          docker_memory_limit: memoryLimit || undefined,
          docker_max_cpu_cores: cpuLimit || undefined,
        },
        allow_game_server_creation: allowGameServerCreation,
        mc_router_allow_all_domains: mcRouterAllowAllDomains,
        mc_router_allowed_domains:
          mcRouterAllowedDomains.length > 0 ? mcRouterAllowedDomains : undefined,
        port_restrictions_enabled: !allowAllPorts,
        allowed_ports: allowedPorts.length > 0 ? allowedPorts : undefined,
      });
      setGeneratedKey(data.secret_key || "");
      setView("result");
    } catch (_e) {
      // Toast is handled in useDataInteractions
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = !usernameError && !cpuError && !memoryError;

  const handleCopyLink = () => {
    if (generatedKey) {
      const link = `${window.location.origin}/?inviteToken=${generatedKey}`;
      navigator.clipboard.writeText(link);
      notificationModal.success({ message: t("toasts.copyClipboardSuccess") });
    }
  };

  const resetView = useCallback(() => {
    setView("invite");
    setInviteUsername("");
    setGeneratedKey(null);
    setUsernameError(null);
    setCpuError(null);
    setMemoryError(null);
    // Reset restriction states
    setAllowGameServerCreation(true);
    setMcRouterAllowAllDomains(false);
    setMcRouterAllowedDomains([]);
    setAllowAllPorts(true);
    setAllowedPorts([]);
  }, []);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (open) {
          resetView();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className={props.className} aria-label={t("userModal.title")}>
          <Icon src={addUserIcon} className="size-5" bold={true} />
          {t("userModal.inviteUserTitle")}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[55%] min-w-96 max-w-2xl">
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
              allowGameServerCreation={allowGameServerCreation}
              mcRouterAllowAllDomains={mcRouterAllowAllDomains}
              mcRouterAllowedDomains={mcRouterAllowedDomains}
              allowAllPorts={allowAllPorts}
              allowedPorts={allowedPorts}
              onUsernameChange={handleUsernameChange}
              onMemoryChange={handleMemoryChange}
              onCpuChange={handleCpuChange}
              onAllowGameServerCreationChange={setAllowGameServerCreation}
              onMcRouterAllowAllDomainsChange={setMcRouterAllowAllDomains}
              onMcRouterAllowedDomainsChange={setMcRouterAllowedDomains}
              onAllowAllPortsChange={setAllowAllPorts}
              onAllowedPortsChange={setAllowedPorts}
              onCancel={() => setIsDialogOpen(false)}
              onSubmit={handleCreateInvite}
              onUserRoleChange={setUserRole}
              isCreating={isCreating}
              usernameError={usernameError}
              cpuError={cpuError}
              memoryError={memoryError}
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
              <Button onClick={() => setIsDialogOpen(false)} variant="secondary">
                {t("userModal.cancel")}
              </Button>
              <Button onClick={handleCreateInvite} disabled={isCreating || !isFormValid}>
                {isCreating ? t("userModal.creating") : t("userModal.generateInvite")}
              </Button>
            </>
          )}
          {view === "result" && (
            <Button onClick={resetView} variant="secondary">
              {t("userModal.backToUsers")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserInviteButton;
