import { Button } from "@components/ui/button.tsx";
import { useState } from "react";
import { useGetAllWebhooks } from "@/api/generated/backend-api.ts";
import type { WebhookDto } from "@/api/generated/model";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import useWebhookDataInteractions from "@/hooks/useWebhookDataInteractions/useWebhookDataInteractions.tsx";
import useWebhookWebSocket from "@/hooks/useWebhookWebSocket/useWebhookWebSocket.ts";
import WebhookList from "./components/WebhookList.tsx";
import WebhookModal from "./components/WebhookModal.tsx";

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
      <p className={"text-sm text-muted-foreground leading-none"}>{t("description")}</p>
      <div className="flex flex-col gap-3">
        <Button className="w-fit" onClick={() => setIsCreateModalOpen(true)}>
          {t("create")}
        </Button>
      </div>

      <WebhookList
        webhooks={webhooks}
        isLoading={isLoading}
        deletingWebhookUuid={deletingWebhookUuid}
        onEdit={setEditingWebhook}
        onDelete={onDeleteWebhook}
        getWebhookTypeLabel={getWebhookTypeLabel}
        getEventLabel={getEventLabel}
        t={t}
      />

      <WebhookModal
        mode="create"
        gameServerUuid={gameServerUuid}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <WebhookModal
        mode="edit"
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
