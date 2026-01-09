import type { GameServerLogMessageEntity } from "@/api/generated/model";
import clsx from "clsx";
import { format } from "date-fns";

const levelColors: Record<string, string> = {
  DEBUG: "text-slate-400",
  INFO: "text-sky-300",
  WARN: "text-amber-300",
  ERROR: "text-red-400",
  FATAL: "text-red-500 font-semibold",
};

const levelBgColors: Record<string, string> = {
  DEBUG: "bg-slate-800/40",
  INFO: "bg-sky-900/20",
  WARN: "bg-amber-900/20",
  ERROR: "bg-red-900/20",
  FATAL: "bg-red-950/60",
};

const LogMessage = ({ message }: { message: GameServerLogMessageEntity }) => {
  const level = (message.level as string) ?? "INFO";
  const timestamp = message.timestamp
    ? format(new Date(message.timestamp), "HH:mm:ss.SSS")
    : "--:--:--.---";

  return (
    <div
      className={clsx(
        "px-2 py-[2px] text-xs leading-5 whitespace-pre-wrap break-words",
        "hover:bg-gray-900/60 transition-colors",
        levelBgColors[level] ?? ""
      )}
    >
      <span className="text-gray-500 mr-2 select-none">{timestamp}</span>
      <span
        className={clsx(
          "inline-block min-w-[52px] text-[10px] uppercase tracking-wide mr-2 select-none",
          levelColors[level] ?? "text-sky-300"
        )}
      >
        {level}
      </span>
      <span className="text-gray-100">
        {message.message ?? ""}
      </span>
    </div>
  );
};

export default LogMessage;

