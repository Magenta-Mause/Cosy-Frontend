import axios from "axios";

export type NotificationType = "success" | "error" | "info";

export interface NotificationModalItem {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  details?: string;
}

type Listener = () => void;

let queue: NotificationModalItem[] = [];
const listeners = new Set<Listener>();
let idCounter = 0;

function generateId(): string {
  return `notification-${++idCounter}-${Date.now()}`;
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): NotificationModalItem[] {
  return queue;
}

export function dismissNotification(id: string) {
  queue = queue.filter((n) => n.id !== id);
  emit();
}

function enqueue(item: Omit<NotificationModalItem, "id">): string {
  const id = generateId();
  queue = [...queue, { ...item, id }];
  emit();
  return id;
}

function extractErrorDetails(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;

  const responseData = error.response?.data;
  if (!responseData) return undefined;

  const data = responseData.data;
  const statusCode = responseData.status_code;
  const path = responseData.path;

  const parts: string[] = [];

  if (typeof data === "string") {
    parts.push(data);
  } else if (data && typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length > 0) {
      parts.push(entries.map(([key, val]) => `${key}: ${val}`).join("\n"));
    }
  }

  if (statusCode) parts.push(`Status: ${statusCode}`);
  if (path) parts.push(`Path: ${path}`);

  return parts.length > 0 ? parts.join("\n") : undefined;
}

export const modal = {
  success(opts: { title?: string; message: string }) {
    return enqueue({ type: "success", ...opts });
  },
  error(opts: { title?: string; message: string; details?: string; cause?: unknown }) {
    const details = opts.details ?? extractErrorDetails(opts.cause);
    return enqueue({ type: "error", title: opts.title, message: opts.message, details });
  },
  info(opts: { title?: string; message: string }) {
    return enqueue({ type: "info", ...opts });
  },
};
