import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@components/ui/context-menu.tsx";
import { type ReactNode, useState } from "react";

export interface RightClickChildren {
  label: string;
  onClick?: () => Promise<void> | void;
  value?: string;
}

export interface RightClickAction {
  label: string;
  onClick?: () => Promise<void> | void;
  render?: ReactNode;
  closeOnClick?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  children?: RightClickChildren[];
  value?: string;
}

interface RightClickMenuProps {
  actions: RightClickAction[];
  children: ReactNode;
}

const RightClickMenu = (props: RightClickMenuProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        {props.actions.map((action, index) =>
          action.render ? (
            <div key={action.label || index}>{action.render}</div>
          ) : !action.children ? (
            <ContextMenuItem
              key={action.label}
              onSelect={async (e) => {
                if (action.closeOnClick === false) {
                  e.preventDefault();
                }
                if (action.onClick) {
                  setLoading(true);
                  await action.onClick();
                  setLoading(false);
                }
              }}
              disabled={loading || action.disabled}
              variant={action.destructive ? "destructive" : "default"}
            >
              {action.label}
            </ContextMenuItem>
          ) : (
            <ContextMenuSub key={action.label}>
              <ContextMenuSubTrigger>{action.label}</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuRadioGroup value={action.value}>
                  {action.children.map((children) => (
                    <ContextMenuRadioItem
                      key={children.label}
                      onClick={children.onClick}
                      value={children.value ?? ""}
                    >
                      {children.label}
                    </ContextMenuRadioItem>
                  ))}
                </ContextMenuRadioGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
          ),
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default RightClickMenu;
