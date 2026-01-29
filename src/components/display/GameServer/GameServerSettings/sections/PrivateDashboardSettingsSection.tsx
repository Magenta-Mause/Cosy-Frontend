import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export default function PrivateDashboardSettingsSection() {
  const { t } = useTranslationPrefix("components.GameServerSettings.sections");

  return (
    <div>
      <h2 className="font-medium text-3xl">{t("privateDashboard")}</h2>
    </div>
  );
}
