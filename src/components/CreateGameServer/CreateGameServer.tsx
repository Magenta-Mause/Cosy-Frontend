import { Button } from "@components/ui/button";
import { Dialog, DialogTrigger } from "@components/ui/dialog";
import CreateGameServerModal from "./CreateGameServerModal";
import { useState } from "react";

export default function createGameServer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <CreateGameServerModal setModalOpen={setModalOpen} />
    </Dialog>
  );
}
