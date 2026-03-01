import { useSyncExternalStore } from "react";
import { NotificationModal } from "@/components/ui/notification-modal";
import { getSnapshot, subscribe } from "@/lib/notificationModal";

export function NotificationModalProvider() {
  const queue = useSyncExternalStore(subscribe, getSnapshot);
  return <NotificationModal item={queue[0]} />;
}
