import { useState, useRef  } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useTranslation } from "react-i18next";
import LogMessage from "@components/display/LogDisplay/LogMessage";
import type { GameServerLogWithUuid } from "@/stores/slices/gameServerLogSlice.ts";

const LogDisplay = ({ logMessages }: { logMessages: GameServerLogWithUuid[] }) => {
  const { t } = useTranslation();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // We use followOutput to handle the "stick to bottom" logic automatically
  // 'smooth' or 'auto' behavior can be defined here
  const followOutput = autoScroll ? "smooth" : false;

  return (
    <div className="flex flex-col border rounded-md bg-gray-950 text-gray-100 font-mono h-96">
      {/* Header / toolbar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 text-xs uppercase tracking-wide text-gray-400">
        <span>{t("logDisplay.serverLog")}</span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="accent-emerald-500"
          />
          <span className="text-[11px]">Follow</span>
        </label>
      </div>

      {/* Virtuoso List */}
      <div className="flex-1 min-h-0">
        <Virtuoso
          ref={virtuosoRef}
          data={logMessages}
          followOutput={followOutput}
          // atBottomStateChange triggers when user scrolls away from/to bottom
          atBottomStateChange={(atBottom) => setAutoScroll(atBottom)}
          initialTopMostItemIndex={logMessages.length - 1}
          itemContent={(_index, message) => (
            <div className="pb-1"> {/* Spacing between logs */}
              <LogMessage key={message.uuid} message={message} />
            </div>
          )}
          // Customizing the scroll container style
          style={{ height: '100%' }}
          // Increases performance by rendering a few items outside the viewport
          overscan={200}
        />
      </div>
    </div>
  );
};

export default LogDisplay;
