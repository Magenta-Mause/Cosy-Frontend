import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@components/ui/context-menu.tsx";
import { type ReactNode, useState } from "react";

export interface RightClickAction {
  label: string;
  onClick: () => Promise<void> | void;
  children?: RightClickAction[];
}

interface RightClickMenuProps {
  actions: RightClickAction[];
  children: ReactNode;
}

const RightClickMenu = (props: RightClickMenuProps) => {
  const closeModal = () => {
    const escapeEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      code: "Escape",
      bubbles: true,
      cancelable: true,
    });

    // Dispatch the event on the desired element, e.g., the document or a specific element
    document.dispatchEvent(escapeEvent);
  };
  const [loading, setLoading] = useState(false);

  const handleAsync = async (callback: () => Promise<void> | void) => {
    setLoading(true);
    await callback();
    setLoading(false);
    closeModal();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        {props.actions.map((action) => (
          <ContextMenuItem
            key={action.label}
            onSelect={async (e) => {
              e.preventDefault();
              await handleAsync(action.onClick);
            }}
            className={"font-['VT323']"}
            disabled={loading}
          >
            {action.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default RightClickMenu;
