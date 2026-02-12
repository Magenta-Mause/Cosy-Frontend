import GameServerOverviewPageRightClickHandler from "@components/display/configurations/GameServerOverviewPageRightClickHandler/GameServerOverviewPageRightClickHandler.tsx";
import OptionsBannerDropdown from "@components/display/header/OptionsBannerDropdown/OptionsBannerDropdown.tsx";
import MarketplaceSign from "@components/display/header/MarketplaceSign/MarketplaceSign.tsx";
import { GameServerNotFoundPage } from "@components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useContext } from "react";

const RootLayout = () => {
  const { authorized } = useContext(AuthContext);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const showNotFound = authorized === false && pathname !== "/";

  return (
    <GameServerOverviewPageRightClickHandler>
      <div>
        <OptionsBannerDropdown />
        <MarketplaceSign />
        {showNotFound ? <GameServerNotFoundPage /> : <Outlet />}
      </div>
    </GameServerOverviewPageRightClickHandler>
  );
};

export const Route = createRootRoute({ component: RootLayout });
