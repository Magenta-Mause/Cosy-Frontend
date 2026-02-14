import type { ReactNode } from "react";
import gameServerStatusBanner from "@/assets/PapyrusBanner.webp";
import { cn } from "@/lib/utils.ts";

const NameAndStatusBanner = (props: {
  children: ReactNode;
  className?: string;
  classNameTextChildren?: string;
}) => {
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
          "relative top-[25%] left-[12%] w-[70%] h-[45%] text-center text-amber-950 text-ellipsis overflow-y-hidden select-none",
          props.classNameTextChildren,
        )}
        style={{ fontSize: "1vw", lineHeight: "1vw" }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default NameAndStatusBanner;
