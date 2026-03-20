import PagedModal, { type PagedModalPage } from "@components/ui/PagedModal.tsx";
import { FileText, Router } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import FooterSettingsPage from "./pages/FooterSettingsPage";
import McRouterSettingsPage from "./pages/McRouterSettingsPage";

type SettingsPage = "mc-router" | "footer";

interface CosyInstanceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPage?: SettingsPage;
}

const CosyInstanceSettingsModal = ({
  open,
  onOpenChange,
  defaultPage,
}: CosyInstanceSettingsModalProps) => {
  const { t } = useTranslationPrefix("cosyInstanceSettings");
  const [dirtyPages, setDirtyPages] = useState<Record<string, boolean>>({});

  const setPageDirty = useCallback((pageId: string) => (dirty: boolean) => {
    setDirtyPages((prev) => {
      if (prev[pageId] === dirty) return prev;
      return { ...prev, [pageId]: dirty };
    });
  }, []);

  const pages: PagedModalPage[] = useMemo(
    () => [
      {
        id: "mc-router",
        label: t("sidebar.mcRouter"),
        icon: <Router className="h-5 w-5" />,
        content: <McRouterSettingsPage onUnsavedChange={setPageDirty("mc-router")} />,
        hasUnsavedChanges: dirtyPages["mc-router"] ?? false,
      },
      {
        id: "footer",
        label: t("sidebar.footer"),
        icon: <FileText className="h-5 w-5" />,
        content: <FooterSettingsPage onUnsavedChange={setPageDirty("footer")} />,
        hasUnsavedChanges: dirtyPages.footer ?? false,
      },
    ],
    [t, dirtyPages, setPageDirty],
  );

  return (
    <PagedModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      pages={pages}
      defaultPageId={defaultPage}
    />
  );
};

export default CosyInstanceSettingsModal;
