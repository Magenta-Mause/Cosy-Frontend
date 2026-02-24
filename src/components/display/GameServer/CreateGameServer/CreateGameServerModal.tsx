import GameServerCreationNextPageButton from "@components/display/GameServer/CreateGameServer/GameServerCreationButton.tsx";
import HouseBuildingProcess from "@components/display/GameServer/CreateGameServer/HouseBuildingProcess.tsx";
import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import ConfirmCreateDialog from "./ConfirmCreateDialog.tsx";
import Step1 from "./CreationSteps/Step1.tsx";
import Step2 from "./CreationSteps/Step2.tsx";
import Step3 from "./CreationSteps/Step3.tsx";
import { GameServerCreationContext } from "./context.ts";
import ReapplyDialog from "./ReapplyDialog.tsx";
import SuccessDialog from "./SuccessDialog.tsx";
import useGameServerCreation from "./useGameServerCreation.ts";

const PAGES = [<Step1 key="step1" />, <Step2 key="step2" />, <Step3 key="step3" />];

interface Props {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}

const CreateGameServerModal = ({ setOpen, isOpen }: Props) => {
  const { t } = useTranslation();
  const {
    creationState,
    isPageValid,
    currentPage,
    setCurrentPage,
    showReapplyDialog,
    showConfirmDialog,
    isCreating,
    showSuccessDialog,
    setShowSuccessDialog,
    successInfo,
    isLastPage,
    setGameServerState,
    setUtilState,
    setCurrentPageValid,
    triggerNextPage,
    handleConfirmReapply,
    handleCancelReapply,
    handleConfirmCreate,
    handleCancelConfirm,
  } = useGameServerCreation({ setOpen, isOpen });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <GameServerCreationContext.Provider
          value={{
            setGameServerState,
            creationState,
            setCurrentPageValid,
            triggerNextPage,
            setUtilState,
            isLastPage,
            isPageValid,
            currentPage,
          }}
        >
          <DialogPortal>
            <DialogOverlay />

            {/* Full-screen layout container living in the same portal */}
            <div className="fixed inset-0 z-50 items-center justify-center gap-5 flex pr-[7vw]">
              {/* Left side (outside the main dialog box) */}
              <aside className="animate-in fade-in-0 slide-in-from-left-8 duration-300">
                <HouseBuildingProcess
                  houseType={creationState.gameServerState.design ?? "HOUSE"}
                  currentStep={currentPage}
                  serverName={creationState.gameServerState.server_name}
                />
              </aside>

              {/* The actual dialog */}
              <DialogContent
                className="static translate-x-0 translate-y-0 flex min-w-[30vw] max-w-[50vw]"
                asChild
              >
                <DialogHeader>
                  <DialogTitle className={"mr-5"}>
                    {t("components.CreateGameServer.steps.title")}
                  </DialogTitle>
                </DialogHeader>

                <DialogMain className="overflow-auto p-6">
                  <div>{PAGES[currentPage]}</div>
                </DialogMain>
                <DialogFooter className="shrink-0 pt-4">
                  {currentPage > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentPage((currentPage) => currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      {t("components.CreateGameServer.backButton")}
                    </Button>
                  )}
                  <GameServerCreationNextPageButton />
                </DialogFooter>
              </DialogContent>
            </div>
          </DialogPortal>
        </GameServerCreationContext.Provider>

        <ReapplyDialog
          open={showReapplyDialog}
          onConfirm={handleConfirmReapply}
          onCancel={handleCancelReapply}
        />
        <ConfirmCreateDialog
          open={showConfirmDialog}
          isCreating={isCreating}
          onConfirm={handleConfirmCreate}
          onCancel={handleCancelConfirm}
        />
      </Dialog>

      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        successInfo={successInfo}
      />
    </>
  );
};

export default CreateGameServerModal;
export type { AutoCompleteSelections, GameServerCreationFormState } from "./context.ts";
export { GameServerCreationContext, GENERIC_GAME_PLACEHOLDER_VALUE } from "./context.ts";
