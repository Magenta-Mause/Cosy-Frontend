import { useTranslation } from "react-i18next";

interface NoAccessProps {
  element: string;
}

export default function NoAccess({ element }: NoAccessProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">{t("settings.noAccessFor", { element })}</div>
        <div className="text-muted-foreground">{t("settings.noAccessDescription")}</div>
      </div>
    </div>
  );
}
