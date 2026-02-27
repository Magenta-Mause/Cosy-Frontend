import { useSyncExternalStore } from "react";
import { subscribe, getSnapshot } from "@/lib/notificationModal";
import { NotificationModal } from "@/components/ui/notification-modal";

export function NotificationModalProvider() {
  const queue = useSyncExternalStore(subscribe, getSnapshot);
  return <NotificationModal item={queue[0]} />;
}
