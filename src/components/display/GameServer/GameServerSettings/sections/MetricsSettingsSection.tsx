import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export default function MetricsSettingsSection() {
  const { t } = useTranslationPrefix("components.GameServerSettings.sections");

  return (
    <div>
      <h2>{t("metrics")}</h2>
    </div>
  );
}
