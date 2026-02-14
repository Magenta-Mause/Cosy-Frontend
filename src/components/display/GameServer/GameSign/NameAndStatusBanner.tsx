import type { ReactNode } from "react";
import { GameServerDtoStatus } from "@/api/generated/model";
import gameServerStatusBanner from "@/assets/PapyrusBanner.webp";
import { cn } from "@/lib/utils.ts";
import GameServerStatusDot from "../GameServerStatusDot/GameServerStatusDot.tsx";

const NameAndStatusBanner = (props: {
  children: ReactNode;
  status?: GameServerDtoStatus;
  className?: string;
  classNameTextChildren?: string;
}) => {
  const status = props.status ?? GameServerDtoStatus.STOPPED;

  return (
    <div
      className={cn("absolute select-none", props.className)}
      tabIndex={-1}
      style={{
        backgroundImage: `url(${gameServerStatusBanner})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "14vw",
        height: "4vw",
      }}
    >
      <div
        tabIndex={-1}
        className={cn(
          "relative top-[25%] left-[12%] w-[70%] h-[45%] select-none overflow-y-hidden",
          "flex items-center justify-center gap-2",
          "text-amber-950",
          props.classNameTextChildren,
        )}
        style={{ fontSize: "1vw", lineHeight: "1vw" }}
      >
        <GameServerStatusDot status={status} showTooltip={true} className="w-3 h-3" />
        <span className="truncate text-ellipsis whitespace-nowrap">{props.children}</span>
      </div>
    </div>
  );
};

export default NameAndStatusBanner;
