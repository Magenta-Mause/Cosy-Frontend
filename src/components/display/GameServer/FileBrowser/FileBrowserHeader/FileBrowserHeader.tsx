import { ChevronRight, Home, Plus, RefreshCw } from "lucide-react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";

type Crumb = { label: string; path: string };

type Props = {
  crumbs: Crumb[];
  loading?: boolean;

  canWrite: boolean;
  canMkdir: boolean;

  onHome: () => void;
  onCrumbClick: (path: string) => void;

  onRefresh?: () => void;
  onNewFolder?: () => void;
};

export const FileBrowserHeader = ({
  crumbs,
  loading,
  canWrite,
  canMkdir,
  onHome,
  onCrumbClick,
  onRefresh,
  onNewFolder,
}: Props) => {
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserHeader");

  return (
    <div className="border-b border-b-border px-3 py-2 flex items-center gap-1 text-sm text-muted-foreground">
      <button type="button" className="flex items-center gap-1 hover:underline" onClick={onHome}>
        <Home className="h-4 w-4" />
        <span className={cn(crumbs.length === 0 && "text-foreground font-medium")}>HOME</span>
      </button>

      {crumbs.map((c, i) => (
        <span key={c.path} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="h-4 w-4" />
          <button
            type="button"
            className={cn(
              "truncate hover:underline",
              i === crumbs.length - 1 && "text-foreground font-medium",
            )}
            onClick={() => onCrumbClick(c.path)}
            title={c.path}
          >
            {c.label}
          </button>
        </span>
      ))}

      <span className="ml-auto flex items-center gap-2">
        {canWrite && canMkdir ? (
          <button
            type="button"
            onClick={onNewFolder}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1",
              "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
            disabled={loading}
            title={t("newFolder")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("newFolder")}</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onRefresh}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1",
            "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          )}
          aria-label={t("refresh")}
          disabled={loading}
          title={t("refresh")}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          <span className="hidden sm:inline">{t("refresh")}</span>
        </button>
      </span>
    </div>
  );
};
