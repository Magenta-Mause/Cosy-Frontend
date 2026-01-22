import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Copy, Link, PenLine, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useTypedSelector } from "@/stores/rootReducer";

interface UserListProps {
  onRevoke: (uuid: string) => void;
}

const PendingInvites = ({ onRevoke }: UserListProps) => {
  const { t } = useTranslation();
  const invites = useTypedSelector((state) => state.userInviteSliceReducer.data);

  return (
    <div>
      {invites.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("userModal.pendingInvites")}
          </h4>
          {invites.map((invite, index) => (
            <Card key={invite.uuid}>
              <CardContent className="flex gap-4 items-center m-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate leading-5">
                    {invite.username || t("userModal.unclaimedInvite")}
                  </p>
                  {invite.created_at && (
                    <p className="text-sm text-muted-foreground truncate leading-4">
                      {t("userModal.created", {
                        date: new Date(invite.created_at).toLocaleString(),
                      })}
                    </p>
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
                        variant="primary"
                        className="h-10 w-10 hover:text-button-secondary-default"
                      >
                        <PenLine className="size-5" />
                        <span className="sr-only">{t("userModal.editTooltip")}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("userModal.editTooltip")}</p>
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
              {index < invites.length - 1 && <Separator />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingInvites;
