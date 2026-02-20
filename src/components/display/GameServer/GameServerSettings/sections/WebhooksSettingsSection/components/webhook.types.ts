import {
  WebhookCreationDtoSubscribedEventsItem,
  WebhookCreationDtoWebhookType,
  type WebhookDto,
} from "@/api/generated/model";

export type WebhookType = WebhookCreationDtoWebhookType;
export type WebhookEvent = WebhookCreationDtoSubscribedEventsItem;

export const WEBHOOK_TYPES = Object.values(WebhookCreationDtoWebhookType);
export const WEBHOOK_EVENTS = Object.values(WebhookCreationDtoSubscribedEventsItem);

export const DEFAULT_WEBHOOK_TYPE = WebhookCreationDtoWebhookType.DISCORD;
export const DEFAULT_SUBSCRIBED_EVENTS: WebhookEvent[] = [
  WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED,
];

export type WebhookFormValues = {
  webhook_type: WebhookType;
  webhook_url: string;
  enabled: boolean;
  subscribed_events: WebhookEvent[];
};

export const webhookDtoToFormValues = (webhook: WebhookDto): WebhookFormValues => ({
  webhook_type: webhook.webhook_type ?? DEFAULT_WEBHOOK_TYPE,
  webhook_url: webhook.webhook_url ?? "",
  enabled: webhook.enabled ?? true,
  subscribed_events: webhook.subscribed_events ?? [],
});

export const getDefaultFormValues = (): WebhookFormValues => ({
  webhook_type: DEFAULT_WEBHOOK_TYPE,
  webhook_url: "",
  enabled: true,
  subscribed_events: [...DEFAULT_SUBSCRIBED_EVENTS],
});

export type WebhookFormProps = {
  values: WebhookFormValues;
  errors: {
    webhook_url?: string;
    subscribed_events?: string;
  };
  isSubmitting: boolean;
  onValuesChange: (values: Partial<WebhookFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
};
