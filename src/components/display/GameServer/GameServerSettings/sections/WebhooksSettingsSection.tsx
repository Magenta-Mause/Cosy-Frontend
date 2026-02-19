import { Button } from "@components/ui/button";
import { useState } from "react";
import { useGetAllWebhooks } from "@/api/generated/backend-api";
import type { WebhookDto } from "@/api/generated/model";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import useWebhookDataInteractions from "@/hooks/useWebhookDataInteractions/useWebhookDataInteractions";
import useWebhookWebSocket from "@/hooks/useWebhookWebSocket/useWebhookWebSocket";
import CreateWebhookModal from "./WebhooksSettingsSection/components/CreateWebhookModal";
import EditWebhookModal from "./WebhooksSettingsSection/components/EditWebhookModal";

const WebhooksSettingsSection = () => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");
  const { gameServer } = useSelectedGameServer();
  const gameServerUuid = gameServer.uuid ?? "";
  const [deletingWebhookUuid, setDeletingWebhookUuid] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookDto | null>(null);

  const { data: webhooks = [], isLoading } = useGetAllWebhooks(gameServerUuid, {
    query: { enabled: Boolean(gameServerUuid) },
  });

  useWebhookWebSocket(gameServerUuid);

  useWebhookWebSocket(gameServerUuid);

  const { deleteWebhook } = useWebhookDataInteractions();

  const onDeleteWebhook = async (webhookUuid: string) => {
    if (!gameServerUuid) return;
    setDeletingWebhookUuid(webhookUuid);
    try {
      await deleteWebhook({ gameserverUuid: gameServerUuid, webhookUuid });
    } finally {
      setDeletingWebhookUuid(null);
    }
  };

  const getWebhookTypeLabel = (type: string | undefined): string => {
    if (!type) return "-";
    return t(`types.${type}`);
  };

  const getEventLabel = (event: string): string => {
    return t(`events.${event}`);
  };

  return (
    <div className="pr-3 pb-10 gap-6 flex flex-col">
      <div>
        <h2>{t("title")}</h2>
      </div>

      <div className="flex flex-col gap-3">
        <Button className="w-fit" onClick={() => setIsCreateModalOpen(true)}>
          {t("create")}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg">{t("configuredWebhooks")}</h3>
        {isLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!isLoading && webhooks.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}

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
              <Button
                type="button"
                variant="secondary"
                disabled={!webhook.uuid}
                onClick={() => setEditingWebhook(webhook)}
              >
                {t("edit")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!webhook.uuid || deletingWebhookUuid === webhook.uuid}
                onClick={() => webhook.uuid && onDeleteWebhook(webhook.uuid)}
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CreateWebhookModal
        gameServerUuid={gameServerUuid}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditWebhookModal
        gameServerUuid={gameServerUuid}
        webhook={editingWebhook}
        open={!!editingWebhook}
        onOpenChange={(open: boolean) => {
          if (!open) setEditingWebhook(null);
        }}
      />
    </div>
  );
};

export default WebhooksSettingsSection;
