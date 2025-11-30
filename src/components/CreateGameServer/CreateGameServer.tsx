import { Button } from "@components/ui/button";
import { Dialog, DialogTrigger } from "@components/ui/dialog";
import { useState } from "react";
import CreateGameServerModal from "./CreateGameServerModal";

export default function createGameServer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create new Game Server</Button>
      </DialogTrigger>
      <CreateGameServerModal setModalOpen={setModalOpen} />
    </Dialog>
  );
}
