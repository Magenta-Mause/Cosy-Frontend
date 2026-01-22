import type {GameServerCreationDto} from "@/api/generated/model";

export type GameServerCreationAttributeType = keyof GameServerCreationDto | "template";
