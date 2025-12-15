import { Dialog } from "@components/ui/dialog";
import type { Dispatch, SetStateAction } from "react";
import CreateGameServerModal from "./CreateGameServerModal";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function CreateGameServer({ isModalOpen: openModal, setIsModalOpen: setOpenModal }: Props) {
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <CreateGameServerModal setOpen={setOpenModal} />
    </Dialog>
  );
}
