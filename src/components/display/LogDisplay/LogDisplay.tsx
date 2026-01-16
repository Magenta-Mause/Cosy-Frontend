import { useState, useEffect, useRef } from "react";
import { Virtuoso } from "react-virtuoso";
import { useTranslation } from "react-i18next";
import LogMessage from "@components/display/LogDisplay/LogMessage";
import type { GameServerLogWithUuid } from "@/stores/slices/gameServerLogSlice.ts";

const LogDisplay = (props: { logMessages: GameServerLogWithUuid[] }) => {
  const { t } = useTranslation();
  const { logMessages: rawLogs } = props;

  const [displayLogs, setDisplayLogs] = useState<GameServerLogWithUuid[]>([]);
  const [sticky, setSticky] = useState(true);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current && rawLogs.length > 0) {
      setDisplayLogs(rawLogs);
      setTimeout(() => { isInitialLoad.current = false; }, 500);
      return;
    }

    const handler = setTimeout(() => {
      setDisplayLogs(rawLogs);
    }, 100);

    return () => clearTimeout(handler);
  }, [rawLogs]);

  return (
    <div className="flex flex-col border rounded-md bg-gray-950 text-gray-100 font-mono h-96">
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 text-xs uppercase tracking-wide text-gray-400">
        <span>{t("logDisplay.serverLog")}</span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sticky}
            onChange={(e) => setSticky(e.target.checked)}
            className="accent-emerald-500"
          />
          <span className="text-[11px]">Stick to bottom</span>
        </label>
      </div>

      <div className="flex-1 min-h-0">
        <Virtuoso
          key={displayLogs.length === 0 ? 'empty' : 'loaded'}
          data={displayLogs}
          followOutput={sticky ? "auto" : false}
          atBottomStateChange={(atBottom) => {
            if (!isInitialLoad.current) setSticky(atBottom);
          }}
          atBottomThreshold={20}
          // This ensures that items are aligned to the bottom of the list
          // container, which helps prevent the "half-hidden" last item.
          alignToBottom

          // Explicitly use the UUID as the key for better re-render tracking
          computeItemKey={(_index, item) => item.uuid}

          initialTopMostItemIndex={displayLogs.length > 0 ? displayLogs.length - 1 : 0}
          itemContent={(_index, message) => (
            <div className="w-full overflow-hidden">
              <LogMessage message={message} />
            </div>
          )}
          style={{ height: "100%" }}
          overscan={400}
          // Adding a tiny bit of bottom padding to the list content
          // ensures the last log isn't flush against the edge.
          components={{
            Footer: () => <div className="h-2" />,
          }}
        />
      </div>
    </div>
  );
};

export default LogDisplay;
