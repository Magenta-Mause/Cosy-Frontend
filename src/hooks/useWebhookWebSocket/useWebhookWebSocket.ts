import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import config from "@/config";
import { webhookSliceActions } from "@/stores/slices/webhookSlice";

interface WebhookWebSocketMessage {
  eventType: "webhook.created" | "webhook.updated" | "webhook.deleted";
  serverUuid: string;
  webhook: unknown;
}

const useWebhookWebSocket = (gameServerUuid: string | undefined) => {
  const dispatch = useDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!gameServerUuid || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = config.websocketFactory;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Webhook WebSocket connected");
      reconnectAttempts.current = 0;
      const subscribeMessage = {
        command: "SUBSCRIBE",
        destination: `/topics/game-servers/webhooks/${gameServerUuid}`,
      };
      ws.send(JSON.stringify(subscribeMessage));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebhookWebSocketMessage = JSON.parse(event.data);

        switch (message.eventType) {
          case "webhook.created":
            if (message.webhook) {
              dispatch(webhookSliceActions.addWebhook(message.webhook as never));
            }
            break;
          case "webhook.updated":
            if (message.webhook) {
              dispatch(webhookSliceActions.updateWebhook(message.webhook as never));
            }
            break;
          case "webhook.deleted":
            if (
              message.webhook &&
              typeof message.webhook === "object" &&
              "uuid" in message.webhook
            ) {
              dispatch(
                webhookSliceActions.removeWebhook((message.webhook as { uuid: string }).uuid),
              );
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing webhook websocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Webhook WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Webhook WebSocket disconnected");
      wsRef.current = null;

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };
  }, [gameServerUuid, dispatch]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
  };
};

export default useWebhookWebSocket;
