import { getAuthToken } from "./axiosInstance";

export type GameServerInstanceDto = {
  ports: number[];
};

type StartEventDto =
  | { type: "HEARTBEAT"; game_server_instance?: undefined; message?: undefined }
  | { type: "DONE"; game_server_instance: GameServerInstanceDto; message?: undefined }
  | { type: "ERROR"; game_server_instance?: undefined; message: string };

export async function startServiceSse(serviceName: string): Promise<GameServerInstanceDto> {
  const response = await fetch(`/api/game-server/${serviceName}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: "text/event-stream",
    },
  });

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  return new Promise<GameServerInstanceDto>((resolve, reject) => {
    function read() {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            reject(new Error("Stream ended before DONE or ERROR event"));
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          buffer = lines.pop() ?? "";

          for (let line of lines) {
            if (!line.trim()) continue;
            if (!line.trim().slice(5)) continue;
            line = line.trim().slice(5);
            try {
              const event: StartEventDto = JSON.parse(line);

              if (event.type === "HEARTBEAT") {
              } else if (event.type === "DONE") {
                resolve(event.game_server_instance);
                return;
              } else if (event.type === "ERROR") {
                reject(new Error(event.message));
                return;
              }
            } catch (err) {
              console.error("Failed to parse event", err);
            }
          }

          read();
        })
        .catch(reject);
    }

    read();
  });
}
