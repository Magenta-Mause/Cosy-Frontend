import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export default function MetricsSettingsSection() {
  const { t } = useTranslationPrefix("components.GameServerSettings.sections");

  return (
    <div>
      <h2 className="font-medium text-3xl">{t("metrics")}</h2>
    </div>
  );
}
