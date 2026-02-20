import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { useTranslation } from "react-i18next";
import {
  WEBHOOK_EVENTS,
  WEBHOOK_TYPES,
  type WebhookEvent,
  type WebhookFormProps,
  type WebhookType,
} from "./webhook.types";

const WebhookForm = ({ values, errors, isSubmitting, onValuesChange }: WebhookFormProps) => {
  const { t } = useTranslation();

  const handleWebhookTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValuesChange({ webhook_type: e.target.value as WebhookType });
  };

  const handleWebhookUrlChange = (value: string) => {
    onValuesChange({ webhook_url: value });
  };

  const handleEnabledToggle = () => {
    onValuesChange({ enabled: !values.enabled });
  };

  const handleEventToggle = (event: WebhookEvent, checked: boolean) => {
    onValuesChange({
      subscribed_events: checked
        ? values.subscribed_events.includes(event)
          ? values.subscribed_events
          : [...values.subscribed_events, event]
        : values.subscribed_events.filter((e) => e !== event),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold" htmlFor="webhook-type">
          {t("components.GameServerSettings.webhooks.form.webhookType")}
        </label>
        <select
          id="webhook-type"
          className="text-sm border border-input rounded-md px-3 py-2"
          value={values.webhook_type}
          onChange={handleWebhookTypeChange}
          disabled={isSubmitting}
        >
          {WEBHOOK_TYPES.map((value) => (
            <option className="text-sm" key={value} value={value}>
              {t(`components.GameServerSettings.webhooks.types.${value}`)}
            </option>
          ))}
        </select>
      </div>

      <Input
        id="webhook-url"
        header={t("components.GameServerSettings.webhooks.form.webhookUrl")}
        value={values.webhook_url}
        onChange={(e) => handleWebhookUrlChange(e.target.value)}
        error={errors.webhook_url}
        disabled={isSubmitting}
      />

      <button
        type="button"
        className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
        onClick={handleEnabledToggle}
        disabled={isSubmitting}
      >
        <Checkbox checked={values.enabled} className="size-5" tabIndex={-1} />
        <span className="text-sm">{t("components.GameServerSettings.webhooks.form.enabled")}</span>
      </button>

      <div className="flex flex-col gap-2">
        {" "}
        <p className="text-sm font-bold">
          {t("components.GameServerSettings.webhooks.form.subscribedEvents")}
        </p>
        {WEBHOOK_EVENTS.map((event) => (
          <button
            type="button"
            key={event}
            className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
            onClick={() => handleEventToggle(event, !values.subscribed_events.includes(event))}
            disabled={isSubmitting}
          >
            <Checkbox
              checked={values.subscribed_events.includes(event)}
              className="size-5"
              tabIndex={-1}
            />
            <span className="text-sm">
              {t(`components.GameServerSettings.webhooks.events.${event}`)}
            </span>
          </button>
        ))}
        {errors.subscribed_events && (
          <p className="text-sm text-destructive">{errors.subscribed_events}</p>
        )}
      </div>
    </div>
  );
};

export default WebhookForm;
