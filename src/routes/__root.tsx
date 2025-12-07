import GameServerOverviewPageRightClickHandler from "@components/display/configurations/GameServerOverviewPageRightClickHandler/GameServerOverviewPageRightClickHandler.tsx";
import LanguageSelector from "@components/display/configurations/LanguageSelector/LanguageSelector.tsx";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => {
  return (
    <GameServerOverviewPageRightClickHandler>
      <div>
        <LanguageSelector className={"absolute z-100 top-0 right-0 mx-[2vw] my-[1vw]"} />
        <Outlet />
      </div>
    </GameServerOverviewPageRightClickHandler>
  );
};

export const Route = createRootRoute({ component: RootLayout });
