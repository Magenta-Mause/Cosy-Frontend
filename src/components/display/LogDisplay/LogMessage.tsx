import type {GameServerLogMessage} from "@/api/generated/model";

const LogMessage = (props: { message: GameServerLogMessage }) => {
  return <p>{props.message.message}</p>
}
export default LogMessage;
