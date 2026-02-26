import BackToHomeLink from "@components/display/GameServer/GameServerDetailPageLayout/BackToHomeLink";
import { GameServerNotFoundPage } from "@components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage";
import UserTable from "@components/display/UserManagement/UserDetailPage/UserTable";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { createFileRoute } from "@tanstack/react-router";
import { type CSSProperties, useContext } from "react";
import { UserEntityDtoRole } from "@/api/generated/model";
import marketplace from "@/assets/userManagement/market-bg-day.png";
import marketplace_foreground from "@/assets/userManagement/market-foreground.png";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import { useRequireRoles } from "@/utils/routeGuards";

export const Route = createFileRoute("/users")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { revokeInvite } = useDataInteractions();
  const auth = useContext(AuthContext);

  const hasAccess = useRequireRoles([UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN]);

  if (auth.authorized === null) return null;
  if (!hasAccess) return <GameServerNotFoundPage />;

  return (
    <>
      {/* ── Mobile layout ── */}
      <div className="lg:hidden flex flex-col h-screen bg-background pt-2 gap-3">
        <BackToHomeLink />

        <div className="relative flex justify-center">
          <UserTable onRevoke={revokeInvite} />
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden lg:block w-screen h-screen bg-black relative overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex"
          style={
            {
              width: "max(100vw, 100vh * 640 / 640)",
              height: "max(100vh, 100vw * 640 / 640)",
              backgroundImage: `url(${marketplace})`,
              imageRendering: "pixelated",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            } as CSSProperties
          }
        >
          <div className="grow flex flex-col min-w-0 relative z-10 justify-center h-auto">
            <img
              src={marketplace_foreground}
              alt=""
              className="pointer-events-none absolute w-full top-2 z-0"
              style={{ imageRendering: "pixelated" }}
            />
            <div className="h-[33%]" />
            <div className="overflow-y-auto h-auto aspect-514/241 relative z-10 pt-10 px-[10vw]">
              <UserTable onRevoke={revokeInvite} />
            </div>
            <div className="h-[30.5%]" />
          </div>
        </div>

        <div className="absolute inset-0 z-30 flex pointer-events-none">
          <div className="flex h-25 items-end w-[10%] shrink-0 pointer-events-auto">
            <BackToHomeLink variant="secondary" />
          </div>
          <div className="grow" />
          <div className="w-[10%] shrink-0" />
        </div>
      </div>
    </>
  );
}
