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
        imageRendering: "pixelated",
      }}
    >
      <div
        tabIndex={-1}
        className={cn(
          "absolute inset-0 select-none overflow-hidden",
          "flex items-center justify-center gap-2",
          "px-[18%] py-[25%]",
          "text-amber-950",
          "text-[1.2vw] leading-[1.2vw]",
          props.classNameTextChildren,
        )}
      >
        <GameServerStatusDot status={status} showTooltip={true} className="w-4 h-4 shrink-0" />
        <span className="min-w-0 font-bold truncate whitespace-nowrap text-center">
          {props.children}
        </span>
      </div>
    </div>
  );
};

export default NameAndStatusBanner;
