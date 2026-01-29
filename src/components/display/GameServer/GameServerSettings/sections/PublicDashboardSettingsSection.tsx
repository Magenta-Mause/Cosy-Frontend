import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export default function PublicDashboardSettingsSection() {
  const { t } = useTranslationPrefix("components.GameServerSettings.sections");

  return (
    <div>
      <h2 className="font-medium text-3xl">{t("publicDashboard")}</h2>
    </div>
  );
}
