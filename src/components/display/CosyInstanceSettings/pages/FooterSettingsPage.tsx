import { Button } from "@components/ui/button.tsx";
import { Input } from "@components/ui/input.tsx";
import { Loader2 } from "lucide-react";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useGetFooter } from "@/api/generated/backend-api.ts";
import type { FooterUpdateDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

const FooterSettingsPage = ({
  onUnsavedChange,
}: {
  onUnsavedChange?: (dirty: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("cosyInstanceSettings.footer");
  const { t: tRoot } = useTranslationPrefix("cosyInstanceSettings");
  const { updateFooter } = useDataInteractions();
  const { data: footerData, isLoading } = useGetFooter();

  const [formData, setFormData] = useState<FooterUpdateDto>({
    full_name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
  });
  const [isPending, setIsPending] = useState(false);

  const originalData = useMemo<FooterUpdateDto>(
    () => ({
      full_name: footerData?.full_name || "",
      email: footerData?.email || "",
      phone: footerData?.phone || "",
      street: footerData?.street || "",
      city: footerData?.city || "",
    }),
    [footerData],
  );

  const hasChanges =
    formData.full_name !== originalData.full_name ||
    formData.email !== originalData.email ||
    formData.phone !== originalData.phone ||
    formData.street !== originalData.street ||
    formData.city !== originalData.city;

  useEffect(() => {
    onUnsavedChange?.(hasChanges);
  }, [hasChanges, onUnsavedChange]);

  useEffect(() => {
    setFormData(originalData);
  }, [originalData]);

  const isFormValid =
    formData.full_name.length > 0 &&
    formData.email.length > 0 &&
    formData.phone.length > 0 &&
    formData.street.length > 0 &&
    formData.city.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsPending(true);
    try {
      await updateFooter(formData);
    } catch (_error) {
      // Error handling is done in the hook
    } finally {
      setIsPending(false);
    }
  };

  const handleRevert = () => {
    setFormData(originalData);
  };

  const updateField = (field: keyof FooterUpdateDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/50" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pt-8 pr-5 pl-2">
      <div className="space-y-6 grow min-h-full">
        <div>
          <h2 className="text-xl font-bold">{t("title")}</h2>
          <p className="text-foreground/70 text-sm mt-1">{t("description")}</p>
        </div>

        <form id="footer-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              header={t("fullName")}
              value={formData.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              disabled={isPending}
            />
            <Input
              type="email"
              header={t("email")}
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder={t("emailPlaceholder")}
              disabled={isPending}
            />
          </div>

          <Input
            type="tel"
            header={t("phone")}
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder={t("phonePlaceholder")}
            disabled={isPending}
            className="max-w-md"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              header={t("street")}
              value={formData.street}
              onChange={(e) => updateField("street", e.target.value)}
              placeholder={t("streetPlaceholder")}
              disabled={isPending}
            />
            <Input
              type="text"
              header={t("city")}
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder={t("cityPlaceholder")}
              disabled={isPending}
            />
          </div>
        </form>
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex items-center gap-4 mr-5 mt-auto">
        <Button variant="secondary" onClick={handleRevert} disabled={isPending || !hasChanges}>
          {tRoot("revert")}
        </Button>
        <Button
          type="submit"
          form="footer-form"
          disabled={!isFormValid || isPending || !hasChanges}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {tRoot("save")}
        </Button>
      </div>
    </div>
  );
};

export default FooterSettingsPage;
