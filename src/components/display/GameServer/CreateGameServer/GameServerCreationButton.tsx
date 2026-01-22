import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { Button } from "@components/ui/button.tsx";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

const GameServerCreationButton = () => {
  const { triggerNextPage, isLastPage, isPageValid, currentPage, creationState } =
    useContext(GameServerCreationContext);
  const { t } = useTranslation();
  const buttonLabel = (() => {
    switch (currentPage) {
      case 0:
        return "components.CreateGameServer.nextStepButton";
      case 1:
        return creationState.utilState.selectedTemplate
          ? "components.CreateGameServer.useTemplate"
          : "components.CreateGameServer.useNoTemplate";
      default:
        return "components.CreateGameServer.createServerButton";
    }
  })();

  return (
    <Button
      type="button"
      variant="primary"
      onClick={triggerNextPage}
      className={
        isLastPage ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500" : ""
      }
      disabled={!isPageValid[currentPage]}
    >
      {t(buttonLabel)}
    </Button>
  );
};

export default GameServerCreationButton;
