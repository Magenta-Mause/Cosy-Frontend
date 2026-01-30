import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export default function AccessManagementSettingsSection() {
  const { t } = useTranslationPrefix("components.GameServerSettings.sections");

  return (
    <div>
      <h2>{t("accessManagement")}</h2>
    </div>
  );
}
