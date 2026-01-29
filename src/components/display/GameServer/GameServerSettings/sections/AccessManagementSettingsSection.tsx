import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export default function AccessManagementSettingsSection() {
  const { t } = useTranslationPrefix("components.GameServerSettings.sections");

  return (
    <div>
      <h2 className="font-medium text-3xl">{t("accessManagement")}</h2>
    </div>
  );
}
