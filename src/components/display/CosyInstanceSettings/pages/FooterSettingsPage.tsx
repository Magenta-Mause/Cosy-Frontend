import { Button } from "@components/ui/button.tsx";
import { Input } from "@components/ui/input.tsx";
import { Loader2 } from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";
import { useGetFooter } from "@/api/generated/backend-api.ts";
import type { FooterUpdateDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

const FooterSettingsPage = () => {
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
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (footerData) {
      setFormData({
        full_name: footerData.full_name || "",
        email: footerData.email || "",
        phone: footerData.phone || "",
        street: footerData.street || "",
        city: footerData.city || "",
      });
      setHasChanges(false);
    }
  }, [footerData]);

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
      setHasChanges(false);
    } catch (_error) {
      // Error handling is done in the hook
    } finally {
      setIsPending(false);
    }
  };

  const handleRevert = () => {
    if (footerData) {
      setFormData({
        full_name: footerData.full_name || "",
        email: footerData.email || "",
        phone: footerData.phone || "",
        street: footerData.street || "",
        city: footerData.city || "",
      });
      setHasChanges(false);
    }
  };

  const updateField = (field: keyof FooterUpdateDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold">{t("title")}</h2>
            <p className="text-foreground/70 text-sm mt-1">{t("description")}</p>
          </div>

          {/* Form */}
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
      </div>

      {/* Footer Actions */}
      <div className="border-t border-black/15 p-4 flex justify-end gap-3 bg-black/5">
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
