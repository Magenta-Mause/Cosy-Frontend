import LogMessage from "@components/display/LogDisplay/LogMessage";
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  VariableSizeList as List,
  type ListOnScrollProps,
  type VariableSizeList,
} from "react-window";
import type { GameServerLogMessageEntity } from "@/api/generated/model";

import { useTranslation } from "react-i18next";

const LIST_HEIGHT = 360; // px
const ESTIMATED_ROW_HEIGHT = 20; // sane default; real height is measured

type RowHeights = Record<number, number>;

const LogDisplay = (props: { logMessages: GameServerLogMessageEntity[] }) => {
  const { t } = useTranslation();
  const { logMessages } = props;
  const itemCount = logMessages.length;

  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<VariableSizeList | null>(null);
  const rowHeightsRef = useRef<RowHeights>({});

  const getItemSize = (index: number) => rowHeightsRef.current[index] ?? ESTIMATED_ROW_HEIGHT;

  // Keep list scrolled to bottom when new items arrive and autoScroll is on
  useEffect(() => {
    if (!autoScroll || itemCount === 0) return;
    listRef.current?.scrollToItem(itemCount - 1, "end");
  }, [itemCount, autoScroll]);

  const handleScroll = ({ scrollOffset }: ListOnScrollProps) => {
    const totalHeight = Object.keys(rowHeightsRef.current).length
      ? // sum known heights, fallback for unknown ones
        logMessages.reduce(
          (sum, _, index) => sum + (rowHeightsRef.current[index] ?? ESTIMATED_ROW_HEIGHT),
          0,
        )
      : itemCount * ESTIMATED_ROW_HEIGHT;

    const viewportBottom = scrollOffset + LIST_HEIGHT;
    const isAtBottom = viewportBottom >= totalHeight - ESTIMATED_ROW_HEIGHT * 2;

    setAutoScroll(isAtBottom);
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
      if (!rowRef.current) return;

      const height = rowRef.current.getBoundingClientRect().height;
      if (height && rowHeightsRef.current[index] !== height) {
        rowHeightsRef.current[index] = height;
        // Recalculate layout from this row downward
        listRef.current?.resetAfterIndex(index);
      }
    }, [index]); // re-measure if that item changes

    const message = logMessages[index];

    return (
      <div style={style}>
        <div ref={rowRef}>
          <LogMessage key={message.uuid ?? index.toString()} message={message} />
        </div>
      </div>
    );
  };

  const innerElementType = useMemo(
    () =>
      forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
        function InnerElement(props, ref) {
          const { style, ...rest } = props;
          return <div ref={ref} style={style} {...rest} className="relative" />;
        },
      ),
    [],
  );

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

      {/* Virtualized log list */}
      <List
        ref={listRef}
        height={LIST_HEIGHT}
        itemCount={itemCount}
        itemSize={getItemSize}
        width="100%"
        onScroll={handleScroll}
        estimatedItemSize={ESTIMATED_ROW_HEIGHT}
        overscanCount={5}
        innerElementType={innerElementType}
      >
        {Row}
      </List>
    </div>
  );
};

export default LogDisplay;
