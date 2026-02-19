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
import { useState } from "react";
import {
  WebhookCreationDtoSubscribedEventsItem,
  WebhookCreationDtoWebhookType,
  type WebhookCreationDtoSubscribedEventsItem as WebhookEvent,
  type WebhookCreationDtoWebhookType as WebhookType,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import useWebhookDataInteractions from "@/hooks/useWebhookDataInteractions/useWebhookDataInteractions";

const WEBHOOK_TYPES = Object.values(WebhookCreationDtoWebhookType);
const WEBHOOK_EVENTS = Object.values(WebhookCreationDtoSubscribedEventsItem);

interface CreateWebhookModalProps {
  gameServerUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateWebhookModal = ({ gameServerUuid, open, onOpenChange }: CreateWebhookModalProps) => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");
  const { createWebhook, isCreatingWebhook } = useWebhookDataInteractions();

  const [webhookType, setWebhookType] = useState<WebhookType>(
    WebhookCreationDtoWebhookType.DISCORD,
  );
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookUrlError, setWebhookUrlError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [subscribedEvents, setSubscribedEvents] = useState<WebhookEvent[]>([
    WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED,
  ]);

  const resetForm = () => {
    setWebhookType(WebhookCreationDtoWebhookType.DISCORD);
    setWebhookUrl("");
    setWebhookUrlError(null);
    setEnabled(true);
    setSubscribedEvents([WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED]);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

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

    await createWebhook({
      gameserverUuid: gameServerUuid,
      data: {
        webhook_type: webhookType,
        webhook_url: webhookUrl.trim(),
        enabled,
        subscribed_events: subscribedEvents,
      },
    });

    resetForm();
    onOpenChange(false);
  };

  const onToggleSubscribedEvent = (event: WebhookEvent, checked: boolean) => {
    setSubscribedEvents((previous) => {
      if (checked) {
        return previous.includes(event) ? previous : [...previous, event];
      }
      return previous.filter((currentEvent) => currentEvent !== event);
    });
  };

  const isCreateDisabled =
    !gameServerUuid ||
    isCreatingWebhook ||
    webhookUrl.trim().length === 0 ||
    subscribedEvents.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("create")}</DialogTitle>
          <DialogDescription>{t("form.webhookUrl")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
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
                    {t(`types.${value}`)}
                  </option>
                ))}
              </select>
            </div>

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
                  <span className="text-sm">{t(`events.${event}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={() => handleClose(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isCreateDisabled}>
            {isCreatingWebhook ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWebhookModal;
