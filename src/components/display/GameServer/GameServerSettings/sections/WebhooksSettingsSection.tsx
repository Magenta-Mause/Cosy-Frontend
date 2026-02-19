import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { useState } from "react";
import { useGetAllWebhooks } from "@/api/generated/backend-api";
import {
  WebhookCreationDtoSubscribedEventsItem,
  WebhookCreationDtoWebhookType,
  type WebhookCreationDtoSubscribedEventsItem as WebhookEvent,
  type WebhookCreationDtoWebhookType as WebhookType,
} from "@/api/generated/model";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import useWebhookDataInteractions from "@/hooks/useWebhookDataInteractions/useWebhookDataInteractions";

const WEBHOOK_TYPES = Object.values(WebhookCreationDtoWebhookType);
const WEBHOOK_EVENTS = Object.values(WebhookCreationDtoSubscribedEventsItem);

const isValidWebhookUrl = (url: string): boolean => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;
  return trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://");
};

const WebhooksSettingsSection = () => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");
  const { gameServer } = useSelectedGameServer();
  const gameServerUuid = gameServer.uuid ?? "";
  const [webhookType, setWebhookType] = useState<WebhookType>(
    WebhookCreationDtoWebhookType.DISCORD,
  );
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookUrlError, setWebhookUrlError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [subscribedEvents, setSubscribedEvents] = useState<WebhookEvent[]>([
    WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED,
  ]);
  const [deletingWebhookUuid, setDeletingWebhookUuid] = useState<string | null>(null);

  const { data: webhooks = [], isLoading } = useGetAllWebhooks(gameServerUuid, {
    query: { enabled: Boolean(gameServerUuid) },
  });

  const { createWebhook, deleteWebhook, isCreatingWebhook } = useWebhookDataInteractions();

  const validateWebhookUrl = (url: string): string | null => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return t("validation.webhookUrlRequired");
    }
    if (!isValidWebhookUrl(url)) {
      return t("validation.webhookUrlInvalid");
    }
    return null;
  };

  const handleWebhookUrlChange = (value: string) => {
    setWebhookUrl(value);
    if (webhookUrlError) {
      setWebhookUrlError(null);
    }
  };

  const isCreateDisabled =
    !gameServerUuid ||
    isCreatingWebhook ||
    webhookUrl.trim().length === 0 ||
    subscribedEvents.length === 0;

  const onCreateWebhook = async () => {
    if (isCreateDisabled) return;

    const error = validateWebhookUrl(webhookUrl);
    if (error) {
      setWebhookUrlError(error);
      return;
    }

    await createWebhook({
      gameserverUuid: gameServerUuid,
      data: {
        webhook_type: webhookType,
        webhook_url: webhookUrl.trim(),
        enabled,
        subscribed_events: subscribedEvents,
      },
    });
    setWebhookUrl("");
    setEnabled(true);
    setSubscribedEvents([WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED]);
    setWebhookType(WebhookCreationDtoWebhookType.DISCORD);
  };

  const onToggleSubscribedEvent = (event: WebhookEvent, checked: boolean) => {
    setSubscribedEvents((previous) => {
      if (checked) {
        return previous.includes(event) ? previous : [...previous, event];
      }
      return previous.filter((currentEvent) => currentEvent !== event);
    });
  };

  const onDeleteWebhook = async (webhookUuid: string) => {
    if (!gameServerUuid) return;
    setDeletingWebhookUuid(webhookUuid);
    try {
      await deleteWebhook({ gameserverUuid: gameServerUuid, webhookUuid });
    } finally {
      setDeletingWebhookUuid(null);
    }
  };

  const getWebhookTypeLabel = (type: WebhookType): string => {
    return t(`types.${type}`);
  };

  const getEventLabel = (event: WebhookEvent): string => {
    return t(`events.${event}`);
  };

  return (
    <div className="pr-3 pb-10 gap-6 flex flex-col">
      <div>
        <h2>{t("title")}</h2>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        <label className="text-sm font-medium" htmlFor="webhook-type">
          {t("form.webhookType")}
        </label>
        <select
          id="webhook-type"
          className="border border-input rounded-md bg-primary-banner px-3 py-2"
          value={webhookType}
          onChange={(event) => setWebhookType(event.target.value as WebhookType)}
        >
          {WEBHOOK_TYPES.map((value) => (
            <option key={value} value={value}>
              {getWebhookTypeLabel(value)}
            </option>
          ))}
        </select>

        <Input
          id="webhook-url"
          header={t("form.webhookUrl")}
          value={webhookUrl}
          onChange={(event) => handleWebhookUrlChange(event.target.value)}
          placeholder="https://example.com/webhook"
          error={webhookUrlError ?? undefined}
        />

        <button
          type="button"
          className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
          onClick={() => setEnabled((previous) => !previous)}
        >
          <Checkbox checked={enabled} className="size-5" />
          <span className="text-sm">{t("form.enabled")}</span>
        </button>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{t("form.subscribedEvents")}</p>
          {WEBHOOK_EVENTS.map((event) => (
            <button
              type="button"
              key={event}
              className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
              onClick={() => onToggleSubscribedEvent(event, !subscribedEvents.includes(event))}
            >
              <Checkbox checked={subscribedEvents.includes(event)} className="size-5" />
              <span className="text-sm">{getEventLabel(event)}</span>
            </button>
          ))}
        </div>

        <Button
          type="button"
          className="w-fit"
          onClick={onCreateWebhook}
          disabled={isCreateDisabled}
        >
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
                {webhook.webhook_type ? getWebhookTypeLabel(webhook.webhook_type) : "-"}
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
            <div>
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
    </div>
  );
};

export default WebhooksSettingsSection;
