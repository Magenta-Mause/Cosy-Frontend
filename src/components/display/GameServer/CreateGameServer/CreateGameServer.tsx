import type { Dispatch, SetStateAction } from "react";
import CreateGameServerModal from "./CreateGameServerModal.tsx";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function CreateGameServer({ isModalOpen, setIsModalOpen: setOpenModal }: Props) {
  return <CreateGameServerModal setOpen={setOpenModal} isOpen={isModalOpen} />;
}
