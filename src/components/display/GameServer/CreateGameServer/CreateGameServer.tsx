import { Dialog } from "@components/ui/dialog.tsx";
import type { Dispatch, SetStateAction } from "react";
import CreateGameServerModal from "./CreateGameServerModal.tsx";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function CreateGameServer({
  isModalOpen: openModal,
  setIsModalOpen: setOpenModal,
}: Props) {
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <CreateGameServerModal setOpen={setOpenModal} />
    </Dialog>
  );
}
