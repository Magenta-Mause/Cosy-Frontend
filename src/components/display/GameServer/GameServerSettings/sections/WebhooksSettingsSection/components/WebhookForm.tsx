import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import {
  WEBHOOK_EVENTS,
  WEBHOOK_TYPES,
  type WebhookEvent,
  type WebhookFormProps,
  type WebhookType,
} from "./webhook.types";

const WebhookForm = ({
  values,
  errors,
  isSubmitting,
  onValuesChange,
  onSubmit,
  onCancel,
  submitLabel,
}: WebhookFormProps) => {
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
          Webhook Type
        </label>
        <select
          id="webhook-type"
          className="text-sm border border-input rounded-md bg-primary-banner px-3 py-2"
          value={values.webhook_type}
          onChange={handleWebhookTypeChange}
          disabled={isSubmitting}
        >
          {WEBHOOK_TYPES.map((value) => (
            <option className="text-sm" key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <Input
        id="webhook-url"
        header="Webhook URL"
        value={values.webhook_url}
        onChange={(e) => handleWebhookUrlChange(e.target.value)}
        placeholder="https://example.com/webhook"
        error={errors.webhook_url}
        disabled={isSubmitting}
      />

      <button
        type="button"
        className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
        onClick={handleEnabledToggle}
        disabled={isSubmitting}
      >
        <Checkbox checked={values.enabled} className="size-5" />
        <span className="text-sm">Enabled</span>
      </button>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Subscribed Events</p>
        {WEBHOOK_EVENTS.map((event) => (
          <button
            type="button"
            key={event}
            className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
            onClick={() => handleEventToggle(event, !values.subscribed_events.includes(event))}
            disabled={isSubmitting}
          >
            <Checkbox checked={values.subscribed_events.includes(event)} className="size-5" />
            <span className="text-sm">{event}</span>
          </button>
        ))}
        {errors.subscribed_events && (
          <p className="text-sm text-destructive">{errors.subscribed_events}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default WebhookForm;
