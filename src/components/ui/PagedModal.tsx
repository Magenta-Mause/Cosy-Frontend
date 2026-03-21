import type { ReactNode } from "react";
import {Button} from "@components/ui/button.tsx";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogMain, DialogTitle,} from "@components/ui/dialog.tsx";
import {Separator} from "@components/ui/separator.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import {cn} from "@/lib/utils";
import PixelIcon from "@components/ui/PixelIcon.tsx";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon, label, isActive, onClick }: SidebarItemProps) => (
  <div className="py-0.5 w-full">
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-2 min-w-0 flex justify-start border-0 shadow-none bg-button-primary-default",
        isActive && "bg-button-primary-active hover:bg-button-primary-active/80",
      )}
    >
      <PixelIcon icon={icon} className="w-5 h-5"/>
      <span className="truncate text-left text-sm">{label}</span>
    </Button>
  </div>
);

export interface PagedModalPage {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
  hasUnsavedChanges?: boolean;
}

interface PagedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pages: PagedModalPage[];
  defaultPageId?: string;
  sizeClassName?: string;
}

const PagedModal = ({
  open,
  onOpenChange,
  title,
  pages,
  defaultPageId,
  sizeClassName = "max-w-[80vw] w-[80vw] h-[80vh] max-h-[80vh]",
}: PagedModalProps) => {
  const { t } = useTranslationPrefix("genericModal.unsavedModal");
  const [activePageId, setActivePageId] = useState(defaultPageId || pages[0]?.id);
  const [pendingAction, setPendingAction] = useState<{ type: "switch"; targetId: string } | { type: "close" } | null>(null);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const activePageRef = useRef(activePage);
  activePageRef.current = activePage;

  useEffect(() => {
    setActivePageId(defaultPageId || pages[0]?.id);
  }, [defaultPageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageSwitch = useCallback((targetId: string) => {
    if (activePageRef.current?.hasUnsavedChanges) {
      setPendingAction({ type: "switch", targetId });
    } else {
      setActivePageId(targetId);
    }
  }, []);

  const handleClose = useCallback((openState: boolean) => {
    if (!openState && activePageRef.current?.hasUnsavedChanges) {
      setPendingAction({ type: "close" });
    } else {
      onOpenChange(openState);
    }
  }, [onOpenChange]);

  const handleDiscard = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "switch") {
      setActivePageId(pendingAction.targetId);
    } else {
      onOpenChange(false);
    }
    setPendingAction(null);
  };

  const handleStay = () => {
    setPendingAction(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={cn(sizeClassName, "p-0 flex overflow-hidden gap-0")}>
          <div>
            <DialogTitle className="px-4 text-lg font-bold bg-background border-b border-black/15 mb-0! pb-2 pt-5">
              {title}
            </DialogTitle>
          </div>
          <div className="flex grow max-w-full overflow-hidden">
            <aside className="w-56 shrink-0 flex flex-col pt-4 pl-4 overflow-y-auto">
              <nav>
                {pages.map((page) => (
                  <SidebarItem
                    key={page.id}
                    icon={page.icon}
                    label={page.label}
                    isActive={activePageId === page.id}
                    onClick={() => handlePageSwitch(page.id)}
                  />
                ))}
              </nav>
            </aside>
            <div className="p-4 h-auto overflow-hidden">
              <Separator className="w-0.5! h-full!" orientation="vertical" />
            </div>
            <main className="flex-1 overflow-hidden grow h-full">
              {activePage?.content}
            </main>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingAction !== null} onOpenChange={(v) => { if (!v) handleStay(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <DialogMain className="text-base">
            {t("message")}
          </DialogMain>
          <DialogFooter>
            <Button variant="secondary" onClick={handleStay}>
              {t("stay")}
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              {t("leave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PagedModal;
