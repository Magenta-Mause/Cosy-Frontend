import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { useEffect, useState } from "react";
import {
  type WebhookDto,
  type WebhookUpdateDtoSubscribedEventsItem as WebhookEvent,
  type WebhookUpdateDtoWebhookType as WebhookType,
  WebhookUpdateDtoSubscribedEventsItem,
  WebhookUpdateDtoWebhookType,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import useWebhookDataInteractions from "@/hooks/useWebhookDataInteractions/useWebhookDataInteractions";

const WEBHOOK_TYPES = Object.values(WebhookUpdateDtoWebhookType);
const WEBHOOK_EVENTS = Object.values(WebhookUpdateDtoSubscribedEventsItem);

interface EditWebhookModalProps {
  gameServerUuid: string;
  webhook: WebhookDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditWebhookModal = ({
  gameServerUuid,
  webhook,
  open,
  onOpenChange,
}: EditWebhookModalProps) => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");
  const { updateWebhook } = useWebhookDataInteractions();

  const [webhookType, setWebhookType] = useState<WebhookType>(WebhookUpdateDtoWebhookType.DISCORD);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookUrlError, setWebhookUrlError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [subscribedEvents, setSubscribedEvents] = useState<WebhookEvent[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (webhook && open) {
      setWebhookType(webhook.webhook_type ?? WebhookUpdateDtoWebhookType.DISCORD);
      setWebhookUrl(webhook.webhook_url ?? "");
      setWebhookUrlError(null);
      setEnabled(webhook.enabled ?? true);
      setSubscribedEvents(webhook.subscribed_events ?? []);
    }
  }, [webhook, open]);

  const validateWebhookUrl = (url: string): string | null => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return t("validation.webhookUrlRequired");
    }
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
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

  const handleSubmit = async () => {
    const error = validateWebhookUrl(webhookUrl);
    if (error) {
      setWebhookUrlError(error);
      return;
    }

    if (!webhook?.uuid) return;

    setIsUpdating(true);
    try {
      await updateWebhook({
        gameserverUuid: gameServerUuid,
        webhookUuid: webhook.uuid,
        data: {
          webhook_type: webhookType,
          webhook_url: webhookUrl.trim(),
          enabled,
          subscribed_events: subscribedEvents,
        },
      });
      onOpenChange(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const onToggleSubscribedEvent = (event: WebhookEvent, checked: boolean) => {
    setSubscribedEvents((previous) => {
      if (checked) {
        return previous.includes(event) ? previous : [...previous, event];
      }
      return previous.filter((currentEvent) => currentEvent !== event);
    });
  };

  const isUpdateDisabled =
    !gameServerUuid ||
    !webhook?.uuid ||
    isUpdating ||
    webhookUrl.trim().length === 0 ||
    subscribedEvents.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("edit")}</DialogTitle>
          <DialogDescription>{t("form.webhookUrl")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="edit-webhook-type">
                {t("form.webhookType")}
              </label>
              <select
                id="edit-webhook-type"
                className="border border-input rounded-md bg-primary-banner px-3 py-2"
                value={webhookType}
                onChange={(event) => setWebhookType(event.target.value as WebhookType)}
              >
                {WEBHOOK_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t(`types.${value}`)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="edit-webhook-url"
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
                  <span className="text-sm">{t(`events.${event}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdateDisabled}>
            {isUpdating ? t("updating") : t("edit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditWebhookModal;
