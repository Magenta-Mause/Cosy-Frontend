const config = {
  backendBrokerUrl: import.meta.env.VITE_BACKEND_BROKER_URL ?? "ws://localhost:8080/api/v1/ws",
  websocketFactory: import.meta.env.VITE_WEBSOCKET_FACTORY ?? "http://localhost:8080/api/v1/ws",
};

export default config;
