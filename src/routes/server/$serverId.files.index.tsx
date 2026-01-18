import { createFileRoute } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer";

export const Route = createFileRoute("/server/$serverId/files/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId);
  const navigate = Route.useNavigate();

  const mounts = gameServer?.volume_mounts ?? [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-1">Select a volume mount</h2>
      <p className="text-sm text-muted-foreground">Choose which mount you want to browse.</p>

      {!gameServer && <div className="mt-6 text-sm text-muted-foreground">Loading…</div>}

      {gameServer && mounts.length === 0 && (
        <div className="mt-6 text-sm text-muted-foreground">
          No volume mounts found for this server.
        </div>
      )}

      {mounts.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mounts.map((m, idx) => {
            const volumeId = m.uuid;
            const disabled = !volumeId;

            const title =
              m.container_path ??
              m.host_path ??
              `Mount ${idx + 1}${disabled ? " (missing uuid)" : ""}`;

            return (
              // biome-ignore lint/a11y/useButtonType: TODO
              <button
                key={volumeId ?? idx}
                disabled={disabled}
                onClick={() => {
                  if (!volumeId) return;
                  navigate({
                    to: "/server/$serverId/files/$volumeId",
                    params: { serverId, volumeId },
                  });
                }}
                className={`
                  flex flex-col gap-1 rounded-xl border p-4 text-left transition
                  ${
                    disabled
                      ? "cursor-not-allowed bg-muted/50 text-muted-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }
                `}
              >
                <div className="font-medium">{title}</div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  {m.container_path && (
                    <div>
                      <span className="font-mono">container:</span> {m.container_path}
                    </div>
                  )}
                  {m.host_path && (
                    <div>
                      <span className="font-mono">host:</span> {m.host_path}
                    </div>
                  )}
                  {volumeId && (
                    <div>
                      <span className="font-mono">uuid:</span> {volumeId}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
