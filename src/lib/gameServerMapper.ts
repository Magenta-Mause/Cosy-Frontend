import type { GameServerDto, GameServerUpdateDto } from "@/api/generated/model";

export const mapGameServerDtoToUpdate = (server: GameServerDto): GameServerUpdateDto => ({
  server_name: server.server_name,
  docker_image_name: server.docker_image_name,
  docker_image_tag: server.docker_image_tag,
  port_mappings: server.port_mappings?.map((pm) => ({
    ...pm,
  })),
  environment_variables: server.environment_variables,
  volume_mounts: server.volume_mounts?.map((v) => ({
    container_path: v.container_path || "",
    uuid: v.uuid,
  })),
  execution_command: server.execution_command,
  docker_hardware_limits: {
    docker_memory_limit: server.docker_hardware_limits?.docker_memory_limit,
    docker_max_cpu_cores: server.docker_hardware_limits?.docker_max_cpu_cores,
  },
});
