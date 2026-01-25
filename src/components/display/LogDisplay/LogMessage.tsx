import clsx from "clsx";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  type GameServerLogMessageEntity,
  GameServerLogMessageEntityLevel,
} from "@/api/generated/model";

const levelColors: Record<string, string> = {
  [GameServerLogMessageEntityLevel.INFO]: "text-sky-300",
  [GameServerLogMessageEntityLevel.ERROR]: "text-red-400",
  [GameServerLogMessageEntityLevel.COSY_INFO]: "text-sky-300",
  [GameServerLogMessageEntityLevel.COSY_DEBUG]: "text-amber-300",
  [GameServerLogMessageEntityLevel.COSY_ERROR]: "text-red-400",
};

const levelBgColors: Record<string, string> = {
  [GameServerLogMessageEntityLevel.INFO]: "bg-sky-900/20",
  [GameServerLogMessageEntityLevel.ERROR]: "bg-red-900/20",
  [GameServerLogMessageEntityLevel.COSY_INFO]: "bg-sky-900/20",
  [GameServerLogMessageEntityLevel.COSY_DEBUG]: "bg-amber-900/20",
  [GameServerLogMessageEntityLevel.COSY_ERROR]: "bg-red-900/20",
};

const LogMessage = ({ message }: { message: GameServerLogMessageEntity }) => {
  const { t } = useTranslation();
  const level = (message.level as string) ?? "INFO";
  const timestamp = message.timestamp
    ? format(new Date(message.timestamp), t("logDisplay.timestampFormat"))
    : "--:--:--.---";

  return (
    <div
      className={clsx(
        "px-2 py-[2px] text-xs leading-5 whitespace-pre-wrap break-words",
        "hover:bg-gray-900/60 transition-colors",
        levelBgColors[level] ?? "",
      )}
    >
      <span className="text-gray-500 mr-2 select-none">{timestamp}</span>
      <span
        className={clsx(
          "inline-block min-w-[52px] text-[10px] uppercase tracking-wide mr-2 select-none",
          levelColors[level] ?? "text-sky-300",
        )}
      >
        {level}
      </span>
      <span className="text-gray-100">{message.message ?? ""}</span>
    </div>
  );
};

export default LogMessage;
