import { Dialog, DialogContent, DialogTitle } from "@components/ui/dialog.tsx";
import { FileText, Router } from "lucide-react";
import { useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { cn } from "@/lib/utils";
import FooterSettingsPage from "./pages/FooterSettingsPage";
import McRouterSettingsPage from "./pages/McRouterSettingsPage";

type SettingsPage = "mc-router" | "footer";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon, label, isActive, onClick }: SidebarItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
      isActive
        ? "bg-black/15 text-foreground font-medium border border-black/15"
        : "hover:bg-black/10 text-foreground/80 hover:text-foreground",
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface CosyInstanceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CosyInstanceSettingsModal = ({ open, onOpenChange }: CosyInstanceSettingsModalProps) => {
  const { t } = useTranslationPrefix("cosyInstanceSettings");
  const [activePage, setActivePage] = useState<SettingsPage>("mc-router");

  const renderPage = () => {
    switch (activePage) {
      case "mc-router":
        return <McRouterSettingsPage />;
      case "footer":
        return <FooterSettingsPage />;
      default:
        return <McRouterSettingsPage />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh] max-h-[80vh] p-0 flex flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-black/15 bg-black/5 shrink-0 flex flex-col">
          <DialogTitle className="px-4 py-4 text-lg font-bold bg-background border-b border-black/15">
            {t("title")}
          </DialogTitle>
          <nav className="px-3 space-y-1">
            <SidebarItem
              icon={<Router className="h-5 w-5" />}
              label={t("sidebar.mcRouter")}
              isActive={activePage === "mc-router"}
              onClick={() => setActivePage("mc-router")}
            />
            <SidebarItem
              icon={<FileText className="h-5 w-5" />}
              label={t("sidebar.footer")}
              isActive={activePage === "footer"}
              onClick={() => setActivePage("footer")}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col pt-20">{renderPage()}</main>
      </DialogContent>
    </Dialog>
  );
};

export default CosyInstanceSettingsModal;
