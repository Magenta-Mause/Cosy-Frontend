import RightClickMenu, {
  type RightClickAction,
} from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import CreateGameServer from "@components/display/GameServer/CreateGameServer/CreateGameServer";
import { Link } from "@tanstack/react-router";
import { type CSSProperties, useState } from "react";
import { useTranslation } from "react-i18next";
import constructionImage from "@/assets/MainPage/construction_place.png";
import { cn } from "@/lib/utils.ts";

const ConstructionPlaceHouse = (props: { className?: string; style?: CSSProperties }) => {
  const { t } = useTranslation();

  const [isGameServerCreationModalOpen, setIsOpenGameServerCreationModalOpen] = useState(false);

  const actions: RightClickAction[] = [
    {
      label: t("rightClickMenu.createNewGameserver"),
      onClick: () => {
        setIsOpenGameServerCreationModalOpen(true);
      },
    },
  ];

  return (
    <RightClickMenu actions={actions}>
      <div>
        <CreateGameServer
          isModalOpen={isGameServerCreationModalOpen}
          setIsModalOpen={setIsOpenGameServerCreationModalOpen}
        />
        <Link
          className={cn(
            "block h-auto translate-x-[-3vw] translate-y-[5.8vw] aspect-[2.18] text-xs relative select-none",
            props.className,
          )}
          aria-label={t("aria.createNewGameServer")}
          to={"/"}
          style={{
            ...props.style,
            width: '12.5vw',
            height: '12.5vw',
          }}
          onClick={() => setIsOpenGameServerCreationModalOpen((open) => !open)}
        >
          <img
            className="h-full object-contain max-w-[initial] absolute top-0 left-0"
            aria-label={t("aria.createNewGameServer")}
            src={constructionImage}
            style={{ imageRendering: 'pixelated' }}
          />
        </Link>
      </div>
    </RightClickMenu>
  );
};

export default ConstructionPlaceHouse;
