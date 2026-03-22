import PagedModal, { type PagedModalPage } from "@components/ui/PagedModal.tsx";
import { Cpu, Network, Router, Shield } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import McRouterPermissionsPage from "./pages/McRouterPermissionsPage";
import PermissionsPage from "./pages/PermissionsPage";
import PortRestrictionsPage from "./pages/PortRestrictionsPage";
import ResourceLimitsPage from "./pages/ResourceLimitsPage";

interface UserSettingsModalProps {
  user: UserEntityDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserSettingsModal = ({ user, open, onOpenChange }: UserSettingsModalProps) => {
  const { t } = useTranslationPrefix("userSettingsModal");
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
        id: "resource-limits",
        label: t("sidebar.resourceLimits"),
        icon: <Cpu className="h-5 w-5" />,
        content: <ResourceLimitsPage user={user} onUnsavedChange={setPageDirty("resource-limits")} />,
        hasUnsavedChanges: dirtyPages["resource-limits"] ?? false,
      },
      {
        id: "permissions",
        label: t("sidebar.permissions"),
        icon: <Shield className="h-5 w-5" />,
        content: <PermissionsPage user={user} onUnsavedChange={setPageDirty("permissions")} />,
        hasUnsavedChanges: dirtyPages.permissions ?? false,
      },
      {
        id: "port-restrictions",
        label: t("sidebar.portRestrictions"),
        icon: <Network className="h-5 w-5" />,
        content: <PortRestrictionsPage user={user} onUnsavedChange={setPageDirty("port-restrictions")} />,
        hasUnsavedChanges: dirtyPages["port-restrictions"] ?? false,
      },
      {
        id: "mc-router-permissions",
        label: t("sidebar.mcRouterPermissions"),
        icon: <Router className="h-5 w-5" />,
        content: <McRouterPermissionsPage user={user} onUnsavedChange={setPageDirty("mc-router-permissions")} />,
        hasUnsavedChanges: dirtyPages["mc-router-permissions"] ?? false,
      },
    ],
    [t, user, dirtyPages, setPageDirty],
  );

  return (
    <PagedModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      pages={pages}
      sizeClassName="max-w-[70vw] w-[70vw] h-[70vh] max-h-[70vh]"
    />
  );
};

export default UserSettingsModal;
