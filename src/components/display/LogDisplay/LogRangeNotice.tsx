import { Button } from "@/components/ui/button";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { LOG_RETENTION_DAYS } from "@/lib/timeRange.ts";
import type { DataLoadState } from "@/types/dataLoadState.ts";

interface LogRangeNoticeProps {
  readonly loadedCount: number;
  /** The range holds older lines than the loaded ones. */
  readonly hasOlder: boolean;
  readonly onLoadOlder?: () => void;
  readonly olderState: DataLoadState;
  /** Part of the selected range lies beyond log retention. */
  readonly exceedsRetention: boolean;
}

/** Tells the user when the log view does not show the whole selected range. */
const LogRangeNotice = (props: LogRangeNoticeProps) => {
  const { t } = useTranslationPrefix("logDisplay");
  const { loadedCount, hasOlder, onLoadOlder, olderState, exceedsRetention } = props;

  if (!hasOlder && !exceedsRetention) {
    return null;
  }

  // Both can apply at once: a range reaching past retention may still hold more lines
  // than one page.
  const messages = [
    hasOlder &&
      (olderState === "failed"
        ? t("loadingOlderFailed")
        : t("showingLatest", { count: loadedCount })),
    exceedsRetention && t("retentionNotice", { days: LOG_RETENTION_DAYS }),
  ].filter(Boolean);

  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-1 border-b border-gray-800 text-[11px] text-gray-400"
      data-testid="console-range-notice"
    >
      <span>{messages.join(" · ")}</span>
      {hasOlder && onLoadOlder && (
        <Button
          size="sm"
          variant="secondary"
          className="h-6 px-2 text-[11px]"
          onClick={onLoadOlder}
          loading={olderState === "loading"}
          loadingLabel={t("loadingOlder")}
          data-testid="console-load-older-btn"
        >
          {t("loadOlder")}
        </Button>
      )}
    </div>
  );
};

export default LogRangeNotice;
