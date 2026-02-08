import GameServerOverviewPageRightClickHandler from "@components/display/configurations/GameServerOverviewPageRightClickHandler/GameServerOverviewPageRightClickHandler.tsx";
import OptionsBannerDropdown from "@components/display/configurations/OptionsBannerDropdown/OptionsBannerDropdown.tsx";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => {
  return (
    <GameServerOverviewPageRightClickHandler>
      <div>
        <OptionsBannerDropdown />
        <Outlet />
      </div>
    </GameServerOverviewPageRightClickHandler>
  );
};

export const Route = createRootRoute({ component: RootLayout });
