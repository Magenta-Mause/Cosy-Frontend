import { Button } from "@components/ui/button";
import TooltipWrapper from "@components/ui/TooltipWrapper";
import { Pencil, Trash2 } from "lucide-react";
import type { WebhookDto } from "@/api/generated/model";

interface WebhookListProps {
  webhooks: WebhookDto[];
  isLoading: boolean;
  deletingWebhookUuid: string | null;
  onEdit: (webhook: WebhookDto) => void;
  onDelete: (webhookUuid: string) => void;
  getWebhookTypeLabel: (type: string | undefined) => string;
  getEventLabel: (event: string) => string;
  t: (key: string) => string;
}

const WebhookList = ({
  webhooks,
  isLoading,
  deletingWebhookUuid,
  onEdit,
  onDelete,
  getWebhookTypeLabel,
  getEventLabel,
  t,
}: WebhookListProps) => {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (webhooks.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg">{t("configuredWebhooks")}</h3>
      {webhooks.map((webhook) => (
        <div
          key={webhook.uuid}
          className="border border-border rounded-md p-4 flex justify-between gap-4"
        >
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-semibold">{t("labels.type")}:</span>{" "}
              {getWebhookTypeLabel(webhook.webhook_type)}
            </p>
            <p className="text-sm break-all">
              <span className="font-semibold">{t("labels.url")}:</span> {webhook.webhook_url}
            </p>
            <p className="text-sm">
              <span className="font-semibold">{t("labels.enabled")}:</span>{" "}
              {webhook.enabled ? t("state.enabled") : t("state.disabled")}
            </p>
            <p className="text-sm">
              <span className="font-semibold">{t("labels.events")}:</span>{" "}
              {(webhook.subscribed_events ?? []).map((event) => getEventLabel(event)).join(", ")}
            </p>
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
                onClick={() => webhook.uuid && onDelete(webhook.uuid)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipWrapper>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WebhookList;
