import BackToHomeLink from "@components/display/GameServer/GameServerDetailPageLayout/BackToHomeLink";
import { GameServerNotFoundPage } from "@components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage";
import UserTable from "@components/display/UserManagement/UserDetailPage/UserTable";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { Button } from "@components/ui/button";
import Link from "@components/ui/Link";
import { createFileRoute } from "@tanstack/react-router";
import { UsersIcon } from "lucide-react";
import { type CSSProperties, useContext } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const hasAccess = useRequireRoles([UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN]);

  if (auth.authorized === null) return null;
  if (!hasAccess) return <GameServerNotFoundPage />;

  return (
    <>
      {/* ── Mobile layout ── */}
      <div className="lg:hidden flex flex-col h-screen bg-background">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b-4 border-foreground">
          <Link to="/" className="shrink-0">
            <Button variant="secondary" size="icon-sm">
              <UsersIcon />
            </Button>
          </Link>
          <div className="truncate text-lg font-bold">{t("userManagement.title", "User Management")}</div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-2">
          <UserTable onRevoke={revokeInvite} />
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden lg:block w-screen h-screen bg-black relative overflow-hidden">
        {/* Layer 1: pixelated background + foreground image + content panel */}
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
          {/* Left gutter (mirrors sidebar width) */}
          <div className="w-[10%] shrink-0" />

          {/* Centre column: header spacer + content panel + footer spacer */}
          <div className="grow flex flex-col min-w-0 relative z-10 justify-center h-auto">
            {/* Foreground image sits above bg, behind content */}
            <img
              src={marketplace_foreground}
              alt=""
              className="pointer-events-none absolute w-full top-0 translate-y-1/14 z-0"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Top spacer */}
            <div className="h-[12%]" />

            {/* Main content panel — same proportions as the server detail page */}
            <div className="overflow-y-auto h-auto w-full aspect-514/241 relative z-10">
              <UserTable onRevoke={revokeInvite} />
            </div>

            {/* Bottom spacer */}
            <div className="h-[12%]" />
          </div>

          {/* Right gutter */}
          <div className="w-[10%] shrink-0" />
        </div>

        {/* Layer 2: viewport-edge chrome (exit button) */}
        <div className="absolute inset-0 z-30 flex pointer-events-none">
          <div className="flex h-25 items-end w-[10%] shrink-0 pointer-events-auto">
            <BackToHomeLink variant="secondary" />
          </div>
          <div className="grow" />
          {/* Right column intentionally empty — no tab sidebar needed for this page */}
          <div className="w-[10%] shrink-0" />
        </div>
      </div>
    </>
  );
}
