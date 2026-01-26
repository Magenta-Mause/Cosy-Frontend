import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Link, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { UserInviteDto } from "@/api/generated/model";

interface UserListProps {
  onRevoke: (uuid: string) => void;
  invite: UserInviteDto;
}

const PendingInvites = ({ onRevoke, invite }: UserListProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="flex gap-7 items-center my-3 justify-between">
        <div className="flex flex-col gap-1">
          <div className="font-semibold truncate leading-5">
            {invite.username || t("userModal.unclaimedInvite")}
          </div>
          {invite.created_at && (
            <div className="text-sm text-muted-foreground truncate leading-4">
              {t("userModal.created", {
                date: new Date(invite.created_at).toLocaleString(),
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="primary"
                className="h-10 w-10 hover:text-button-secondary-default"
                onClick={() => {
                  if (invite.secret_key) {
                    const link = `${window.location.origin}/?inviteToken=${invite.secret_key}`;
                    navigator.clipboard.writeText(link);
                    toast.success(t("toasts.copyClipboardSuccess"));
                  }
                }}
              >
                <Link className="size-5" />
                <span className="sr-only">{t("userModal.copyLink")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("userModal.copyTooltip")}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-10 w-10 hover:text-destructive"
                onClick={() => invite.uuid && onRevoke(invite.uuid)}
              >
                <Trash2 className="size-5" />
                <span className="sr-only">{t("userModal.revokeTooltip")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("userModal.revokeTooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvites;
