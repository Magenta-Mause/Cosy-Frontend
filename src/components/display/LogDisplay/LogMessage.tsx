import clsx from "clsx";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  type GameServerLogMessageEntity,
  GameServerLogMessageEntityLevel,
} from "@/api/generated/model";

// 1. Unified styling config for easier maintenance
const LOG_STYLES: Record<string, { text: string; bg: string; border: string; opacity?: number }> = {
  [GameServerLogMessageEntityLevel.INFO]: {
    text: "text-sky-400",
    bg: "bg-sky-950/30",
    border: "border-sky-500",
  },
  [GameServerLogMessageEntityLevel.ERROR]: {
    text: "text-rose-400",
    bg: "bg-rose-950/30",
    border: "border-rose-500",
  },
  [GameServerLogMessageEntityLevel.INPUT]: {
    text: "text-emerald-400",
    bg: "bg-emerald-950/30",
    border: "border-emerald-500",
    opacity: 0.7,
  },
  [GameServerLogMessageEntityLevel.COSY_INFO]: {
    text: "text-cyan-400",
    bg: "bg-cyan-950/20",
    border: "border-cyan-500",
    opacity: 0.7,
  },
  [GameServerLogMessageEntityLevel.COSY_DEBUG]: {
    text: "text-violet-400",
    bg: "bg-violet-950/20",
    border: "border-violet-500",
    opacity: 0.7,
  },
  [GameServerLogMessageEntityLevel.COSY_ERROR]: {
    text: "text-red-400",
    bg: "bg-red-950/40",
    border: "border-red-500",
  },
};

const LogMessage = ({ message }: { message: GameServerLogMessageEntity }) => {
  const { t } = useTranslation();
  const level = (message.level as string) ?? "INFO";
  const styles = LOG_STYLES[level] ?? LOG_STYLES[GameServerLogMessageEntityLevel.INFO];

  const timestamp = message.timestamp
    ? format(new Date(message.timestamp), t("logDisplay.timestampFormat"))
    : "--:--:--.---";

  return (
    <div
      className={clsx(
        "group flex items-start px-3 py-1 text-xs transition-all duration-75",
        "border-l-2 border-transparent hover:border-current", // Subtle hover effect
        "hover:bg-white/5",
        styles.bg,
        `border-l-${styles.border.split("-")[1]}-500/50`, // Set a faint default border
      )}
      style={{
        opacity: styles.opacity,
      }}
    >
      {/* Timestamp: Dimmed so it doesn't distract from the message */}
      <span className="font-mono text-gray-500 mr-3 select-none opacity-70 group-hover:opacity-100">
        {timestamp}
      </span>

      {/* Level Tag: Monospaced and slightly bold for alignment */}
      <span className={clsx("min-w-16.25 font-mono uppercase mr-2 select-none", styles.text)}>
        [{level}]
      </span>

      {/* Message: Clean white/off-white for maximum readability */}
      <span className="text-gray-200 font-mono selection:bg-sky-500/30 leading-relaxed">
        {message.message ?? ""}
      </span>
    </div>
  );
};

export default LogMessage;
