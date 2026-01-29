import { Badge } from "@components/ui/badge.tsx";
import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { Input } from "@components/ui/input.tsx";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useGetUserInvite, useUseInvite } from "@/api/generated/backend-api.ts";
import type { InvalidRequestError } from "@/types/errors.ts";

interface InviteRedemptionModalProps {
  inviteToken: string;
  onClose: () => void;
}

export function InviteRedemptionModal({ inviteToken, onClose }: InviteRedemptionModalProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const formatMemoryLimit = (value: string) => value.replace(/(\d)([a-zA-Z])/g, "$1 $2");

  // Fetch invite details to validate and see if username is pre-filled
  const {
    data: inviteData,
    isLoading: isLoadingInvite,
    isError: isInviteError,
  } = useGetUserInvite(inviteToken, {
    query: {
      retry: false,
      enabled: !!inviteToken,
    },
  });

  // Mutation to register the user
  const { mutate: registerUser, isPending: isRegistering } = useUseInvite();

  useEffect(() => {
    if (inviteData?.username) {
      setUsername(inviteData.username);
    }
  }, [inviteData]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("toasts.passwordsDoNotMatch"));
      return;
    }

    if (!username) {
      toast.error(t("toasts.usernameRequired"));
      return;
    }

    registerUser(
      {
        secretKey: inviteToken,
        data: { username, password },
      },
      {
        onSuccess: () => {
          toast.success(t("toasts.accountCreatedSuccess"));
          handleClose(); // Close modal and clear URL param immediately
        },
        onError: (e) => {
          const typedError = e as InvalidRequestError;
          let error: string | undefined;
          if (typedError.status === 400) {
            const totalError = Object.entries(typedError.response?.data.data ?? {})[0];
            error = totalError ? totalError[1] : undefined;
          } else if (typedError.status === 409) {
            error = typedError.response?.data.data as string;
          }
          toast.error(t("toasts.accountCreateError", { error: error ? error : "Unknown error" }));
        },
      },
    );
  };

  // If explicitly closed or token is missing
  if (!inviteToken) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("inviteRedemption.title")}</DialogTitle>
          <DialogDescription>{t("inviteRedemption.description")}</DialogDescription>
        </DialogHeader>
        {isLoadingInvite ? (
          <DialogMain className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </DialogMain>
        ) : isInviteError ? (
          <div className="py-4 text-center space-y-4">
            <p className="text-destructive font-medium">{t("inviteRedemption.invalidLink")}</p>
            <Button variant="secondary" onClick={handleClose}>
              {t("inviteRedemption.close")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogMain>
              {inviteData?.invite_by_username && (
                <p className="text-base text-muted-foreground text-center">
                  {t("inviteRedemption.invitedBy", { username: inviteData.invite_by_username })}
                </p>
              )}
              <div className="space-y-7">
                {inviteData?.docker_hardware_limits && (
                  <div className="flex flex-col gap-2 mb-4 justify-center items-center">
                    <div className="flex gap-2">
                      {inviteData.docker_hardware_limits.docker_max_cpu_cores && (
                        <Badge className="px-3 text-sm bg-accent">
                          {t("inviteRedemption.cpuLimit", {
                            cpu: inviteData.docker_hardware_limits.docker_max_cpu_cores,
                          })}
                        </Badge>
                      )}
                      {inviteData.docker_hardware_limits.docker_memory_limit && (
                        <Badge className="px-3 text-sm bg-accent">
                          {t("inviteRedemption.memoryLimit", {
                            memory: formatMemoryLimit(
                              inviteData.docker_hardware_limits.docker_memory_limit,
                            ),
                          })}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  header={t("inviteRedemption.usernameLabel")}
                  description={
                    inviteData?.username ? t("inviteRedemption.usernameSetByInviter") : ""
                  }
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("inviteRedemption.usernamePlaceholder")}
                  disabled={!!inviteData?.username || isRegistering} // Disable if pre-set by invite
                  required={!inviteData?.username}
                />

                <Input
                  header={t("inviteRedemption.passwordLabel")}
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("inviteRedemption.passwordPlaceholder")}
                  required
                  disabled={isRegistering}
                />

                <Input
                  header={t("inviteRedemption.confirmPasswordLabel")}
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("inviteRedemption.confirmPasswordPlaceholder")}
                  required
                  disabled={isRegistering}
                />
              </div>
            </DialogMain>

            <DialogFooter className="mt-6 flex gap-5">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isRegistering}
              >
                {t("inviteRedemption.cancel")}
              </Button>
              <Button type="submit" disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("inviteRedemption.creating")}
                  </>
                ) : (
                  t("inviteRedemption.createAccount")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
