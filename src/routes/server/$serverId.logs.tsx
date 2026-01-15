import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/logs")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/server/$serverId/logs"!</div>;
}
