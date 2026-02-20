import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import type { WebhookEvent, WebhookFormValues } from "./webhook.types";

const webhookUrlSchema = z
  .string()
  .min(1, "validation.webhookUrlRequired")
  .refine(
    (url) => url.trim().startsWith("http://") || url.trim().startsWith("https://"),
    "validation.webhookUrlInvalid",
  );

const formSchema = z.object({
  webhook_type: z.string(),
  webhook_url: webhookUrlSchema,
  enabled: z.boolean(),
  subscribed_events: z.array(z.string()).min(1, "validation.subscribedEventsRequired"),
});

type FormErrors = {
  webhook_url?: string;
  subscribed_events?: string;
};

interface UseWebhookFormOptions {
  defaultValues: WebhookFormValues;
  onSubmit: (values: WebhookFormValues) => Promise<void>;
}

export const useWebhookForm = ({ defaultValues, onSubmit }: UseWebhookFormOptions) => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");
  const [values, setValues] = useState<WebhookFormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValuesChange = useCallback((partial: Partial<WebhookFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
    if (partial.webhook_url !== undefined) {
      setErrors((prev) => ({ ...prev, webhook_url: undefined }));
    }
    if (partial.subscribed_events !== undefined) {
      setErrors((prev) => ({ ...prev, subscribed_events: undefined }));
    }
  }, []);

  const toggleSubscribedEvent = useCallback((event: WebhookEvent, checked: boolean) => {
    setValues((prev) => {
      const newEvents = checked
        ? prev.subscribed_events.includes(event)
          ? prev.subscribed_events
          : [...prev.subscribed_events, event]
        : prev.subscribed_events.filter((e) => e !== event);
      return { ...prev, subscribed_events: newEvents };
    });
    setErrors((prev) => ({ ...prev, subscribed_events: undefined }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(defaultValues);
    setErrors({});
  }, [defaultValues]);

  const handleSubmit = useCallback(async () => {
    const result = formSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = t(issue.message);
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, t]);

  const isDisabled = useMemo(() => {
    return (
      values.webhook_url.trim().length === 0 ||
      values.subscribed_events.length === 0 ||
      isSubmitting
    );
  }, [values.webhook_url, values.subscribed_events, isSubmitting]);

  return {
    values,
    errors,
    isSubmitting,
    isDisabled,
    handleValuesChange,
    toggleSubscribedEvent,
    resetForm,
    handleSubmit,
  };
};
