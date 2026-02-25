import type { ReactNode } from "react";
import { GameServerDtoStatus } from "@/api/generated/model";
import gameServerStatusBanner from "@/assets/MainPage/PapyrusScroll.png";
import { cn } from "@/lib/utils.ts";
import GameServerStatusDot from "../GameServerStatusDot/GameServerStatusDot.tsx";

const NameAndStatusBanner = (props: {
  children: ReactNode;
  status?: GameServerDtoStatus;
  className?: string;
  classNameTextChildren?: string;
  hideStatus?: boolean;
}) => {
  const status = props.status ?? GameServerDtoStatus.STOPPED;

  return (
    <div
      className={cn("absolute select-none", props.className)}
      tabIndex={-1}
      style={{
        backgroundImage: `url(${gameServerStatusBanner})`,
        backgroundSize: "100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "13vw",
        height: "4vw",
        imageRendering: "pixelated",
      }}
    >
      <div
        tabIndex={-1}
        className={cn(
          "absolute inset-0 select-none overflow-hidden",
          "flex items-center justify-center gap-2",
          "px-[2.2vw] py-[3.4vw]",
          "text-amber-950",
          "text-[1.35vw] leading-[1.2vw]",
          props.classNameTextChildren,
        )}
      >
        {!props.hideStatus && (
          <GameServerStatusDot status={status} showTooltip={true} useScreenRelativeSizes />
        )}
        <span className="font-bold truncate text-center">{props.children}</span>
      </div>
    </div>
  );
};

export default NameAndStatusBanner;
