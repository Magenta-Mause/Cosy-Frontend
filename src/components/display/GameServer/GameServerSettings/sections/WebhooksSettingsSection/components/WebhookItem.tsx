import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import Icon from "@components/ui/Icon.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper";
import { useState } from "react";
import type { WebhookDto } from "@/api/generated/model";
import checkmarkIcon from "@/assets/icons/checkmark.svg?raw";
import checkmarkCircleIcon from "@/assets/icons/checkmarkCircle.svg?raw";
import closeRoundedIcon from "@/assets/icons/closeRounded.svg?raw";
import copyIcon from "@/assets/icons/copy.svg?raw";
import linkIcon from "@/assets/icons/link.svg?raw";
import pencilWriteIcon from "@/assets/icons/pencilWrite.svg?raw";
import thrashIcon from "@/assets/icons/thrash.svg?raw";

interface WebhookItemProps {
  webhook: WebhookDto;
  deletingWebhookUuid: string | null;
  onEdit: (webhook: WebhookDto) => void;
  onDelete: (webhook: WebhookDto) => void;
  getWebhookTypeLabel: (type: string | undefined) => string;
  getEventLabel: (event: string) => string;
  t: (key: string) => string;
}

const WebhookItem = ({
  webhook,
  deletingWebhookUuid,
  onEdit,
  onDelete,
  getWebhookTypeLabel,
  getEventLabel,
  t,
}: WebhookItemProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    if (!webhook.webhook_url) return;
    await navigator.clipboard.writeText(webhook.webhook_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-lg p-4 flex flex-col gap-4 bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge className="text-sm text-bold bg-accent">
            {getWebhookTypeLabel(webhook.webhook_type)}
          </Badge>
          <div className="flex items-center gap-1.5">
            {webhook.enabled ? (
              <>
                <Icon src={checkmarkCircleIcon} className="size-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">{t("state.enabled")}</span>
              </>
            ) : (
              <>
                <Icon src={closeRoundedIcon} className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("state.disabled")}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <TooltipWrapper tooltip={t("edit")}>
            <Button
              type="button"
              variant="primary"
              size="icon"
              disabled={!webhook.uuid}
              onClick={() => onEdit(webhook)}
            >
              <Icon src={pencilWriteIcon} className="size-4" />
            </Button>
          </TooltipWrapper>
          <TooltipWrapper tooltip={t("delete")}>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              disabled={!webhook.uuid || deletingWebhookUuid === webhook.uuid}
              onClick={() => webhook.uuid && onDelete(webhook)}
            >
              <Icon src={thrashIcon} className="size-4" />
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon src={linkIcon} className="size-5 text-muted-foreground shrink-0" />
          <code className="text-xs bg-muted/50 px-2 py-1 rounded break-all flex-1 font-mono text-muted-foreground">
            {webhook.webhook_url}
          </code>
          <TooltipWrapper tooltip={copied ? t("copied") : t("copyUrl")}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <Icon src={checkmarkIcon} variant="foreground" className="size-5 text-green-500" />
              ) : (
                <Icon src={copyIcon} variant="foreground" className="size-5" />
              )}
            </Button>
          </TooltipWrapper>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-sm text-muted-foreground font-bold shrink-0 mt-0.5">
            {t("labels.events")}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(webhook.subscribed_events ?? []).map((event) => (
              <Badge key={event} variant="secondary" className="text-sm px-1.5 py-0">
                {getEventLabel(event)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookItem;
