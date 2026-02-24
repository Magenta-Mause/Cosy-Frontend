import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import TooltipWrapper from "@components/ui/TooltipWrapper";
import { Check, CheckCircle2, Copy, Link2, Pencil, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import type { WebhookDto } from "@/api/generated/model";

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
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">{t("state.enabled")}</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-muted-foreground" />
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
              <Pencil className="h-4 w-4" />
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
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
                <Check className="h-3.5 w-3.5 bg-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
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
