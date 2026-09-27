import LogMessage from "@/components/display/LogDisplay/LogMessage";
import LogRangeNotice from "@/components/display/LogDisplay/LogRangeNotice.tsx";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon.tsx";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner.tsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useSendCommand } from "@/api/generated/backend-api";
import arrowRightIcon from "@/assets/icons/arrowRight.webp";
import sendIcon from "@/assets/icons/send.webp";
import { cn } from "@/lib/utils.ts";
import type { DataLoadState } from "@/types/dataLoadState.ts";
import type { GameServerLogWithUuid } from "@/types/logTypes";

// Virtuoso needs a large start index to count down from when prepending items.
const FIRST_ITEM_INDEX = 1_000_000;

const LogDisplay = (
  props: {
    logMessages: GameServerLogWithUuid[];
    showCommandInput?: boolean;
    gameServerUuid?: string;
    isServerRunning?: boolean;
    canReadLogs?: boolean;
    hideTimestamps?: boolean;
    showExtendedTimestamps?: boolean;
    disableRoundness?: boolean;
    disableBorder?: boolean;
    overridePermissionCheck?: boolean;
    /** Load state of the initial log fetch, used to render loading/error branches. */
    loadState?: DataLoadState;
    /** The range holds older lines than the loaded ones. */
    hasOlder?: boolean;
    onLoadOlder?: () => void;
    olderState?: DataLoadState;
    /** Number of lines prepended by loading older ones, keeps the scroll position stable. */
    prependedCount?: number;
    /** Part of the selected range lies beyond log retention. */
    exceedsRetention?: boolean;
    onCommandSent?: () => void;
  } & Omit<React.ComponentProps<"div">, "children">,
) => {
  const { t } = useTranslation();
  const {
    logMessages: rawLogs,
    showCommandInput = false,
    gameServerUuid,
    isServerRunning = false,
    canReadLogs = true,
    hideTimestamps,
    showExtendedTimestamps,
    disableRoundness,
    disableBorder,
    overridePermissionCheck,
    loadState = "idle",
    hasOlder = false,
    onLoadOlder,
    olderState = "idle",
    prependedCount = 0,
    exceedsRetention = false,
    onCommandSent,
    ...divProps
  } = props;

  const logDisplayRef = useRef<VirtuosoHandle>(null);
  // Logs and the prepended count are applied together so Virtuoso's firstItemIndex always
  // matches the list it renders — otherwise loading older lines makes the list jump.
  const [display, setDisplay] = useState<{ logs: GameServerLogWithUuid[]; prepended: number }>({
    logs: [],
    prepended: 0,
  });
  const displayLogs = display.logs;
  const [sticky, setSticky] = useState(true);
  const [displayTimestamp, setDisplayTimestamp] = useState(true);
  const [commandInput, setCommandInput] = useState("");
  const isInitialLoad = useRef(true);

  const { mutate: sendCommand, isPending } = useSendCommand();

  useEffect(() => {
    if (isInitialLoad.current && rawLogs.length > 0) {
      setDisplay({ logs: rawLogs, prepended: prependedCount });
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 500);
      return;
    }

    const handler = setTimeout(() => {
      setDisplay({ logs: rawLogs, prepended: prependedCount });
    }, 100);

    return () => clearTimeout(handler);
  }, [rawLogs, prependedCount]);

  const handleSendCommand = () => {
    if (!commandInput.trim() || !gameServerUuid || isPending || !isServerRunning) {
      return;
    }

    sendCommand(
      { uuid: gameServerUuid, data: { command: commandInput } },
      {
        onSuccess: () => {
          setCommandInput("");
          onCommandSent?.();
        },
      },
    );
  };

  const handleAutoScrollToggle = (newVal: boolean) => {
    setSticky(newVal);
  };

  // "LAST" instead of a numeric index: indices are offset by firstItemIndex.
  const scrollToBottom = useCallback(() => {
    logDisplayRef.current?.scrollToIndex({ index: "LAST", align: "end", behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!sticky || displayLogs.length === 0) return;
    scrollToBottom();
  }, [displayLogs, scrollToBottom, sticky]);

  return (
    <div
      {...divProps}
      className={cn(
        "flex flex-col bg-gray-950 text-gray-100 font-mono h-full",
        !disableRoundness && "rounded-md",
        !disableBorder && "border border-gray-800",
        divProps.className,
      )}
    >
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 text-xs uppercase tracking-wide text-gray-400">
        <span>{t("logDisplay.serverLog")}</span>
        <div className={"flex gap-5"}>
          {!hideTimestamps && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={displayTimestamp}
                onChange={(e) => setDisplayTimestamp(e.target.checked)}
                className="accent-emerald-500"
              />
              <span className="text-[11px]">{t("logDisplay.displayTimestamp")}</span>
            </label>
          )}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sticky}
              onChange={(e) => handleAutoScrollToggle(e.target.checked)}
              className="accent-emerald-500"
            />
            <span className="text-[11px]">{t("logDisplay.stickToBottom")}</span>
          </label>
        </div>
      </div>

      {displayLogs.length > 0 && (
        <LogRangeNotice
          loadedCount={displayLogs.length}
          hasOlder={hasOlder}
          onLoadOlder={onLoadOlder}
          olderState={olderState}
          exceedsRetention={exceedsRetention}
        />
      )}

      <div className="flex-1 min-h-0 relative" data-testid="console-log-list">
        <Virtuoso
          ref={logDisplayRef}
          // Decreases as older lines are prepended, so Virtuoso keeps the viewport in place.
          firstItemIndex={FIRST_ITEM_INDEX - display.prepended}
          key={displayLogs.length === 0 ? "empty" : "loaded"}
          data={displayLogs}
          followOutput={sticky ? "auto" : false}
          // This is necessary to ensure that the list doesn't jump around when new logs are added.
          // Without this, the list will jump around when new logs are added because the list is aligned to the bottom.
          atBottomStateChange={(atBottom) => {
            if (!isInitialLoad.current) setSticky(atBottom);
          }}
          atBottomThreshold={20}
          // This ensures that items are aligned to the bottom of the list container
          alignToBottom
          // Explicitly use the UUID as the key for better re-render tracking
          computeItemKey={(_index, item) => item.uuid}
          // Auto scroll to bottom when new logs are added
          initialTopMostItemIndex={{ index: "LAST", align: "end" }}
          itemContent={(_index, message) => (
            <div className="w-full overflow-hidden">
              <LogMessage
                message={message}
                showExtendedTimestamps={showExtendedTimestamps}
                hideTimestamp={hideTimestamps || !displayTimestamp}
              />
            </div>
          )}
          style={{ height: "100%" }}
          // Increase the overscan to ensure that the last log is always visible.
          // This is necessary because the list is aligned to the bottom of the container.
          overscan={400}
          // Adding a tiny bit of bottom padding to the list content
          // ensures the last log isn't flush against the edge.
          components={{
            Footer: () => <div className="h-2" />,
          }}
        />
        {loadState === "loading" && displayLogs.length === 0 && (
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Spinner className="size-8" />
              <span className="text-sm">{t("logDisplay.loadingLogs")}</span>
            </div>
          </div>
        )}
        {loadState === "failed" && displayLogs.length === 0 && (
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-gray-400 text-sm">{t("logDisplay.loadingLogsFailed")}</span>
          </div>
        )}
        {!canReadLogs && !overridePermissionCheck && (
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-gray-400 text-center px-2">
              <div className="text-lg font-semibold mb-2">
                {t("serverPage.noAccessFor", { element: t("serverPage.navbar.console") })}
              </div>
              <div className="text-sm">{t("logDisplay.noLogsPermission")}</div>
            </div>
          </div>
        )}
      </div>

      {showCommandInput && gameServerUuid && (
        <div className="border-t border-gray-800 p-2 flex gap-2">
          <Input
            type="text"
            data-testid="console-command-input"
            placeholder={
              isServerRunning ? t("logDisplay.enterCommand") : t("logDisplay.cantSendCommands")
            }
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendCommand();
              }
            }}
            disabled={!isServerRunning}
            className="bg-gray-900 border-gray-700 text-gray-100 font-mono text-[15px] placeholder:text-gray-500 grow w-auto h-10"
            wrapperClassName={"w-auto grow"}
            startDecorator={
              <Icon src={arrowRightIcon} className="size-4 opacity-50" variant="primary" />
            }
          />
          <Button
            onClick={handleSendCommand}
            data-testid="console-send-btn"
            disabled={!commandInput.trim() || isPending || !isServerRunning}
            size="sm"
            className={"w-fit h-10"}
          >
            <Icon src={sendIcon} className="size-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogDisplay;
