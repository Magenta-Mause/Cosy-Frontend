import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export default function PublicDashboardSettingsSection() {
  const { t } = useTranslationPrefix("components.GameServerSettings.sections");

  return (
    <div>
      <h2>{t("publicDashboard")}</h2>
    </div>
  );
}
