import type {GameServerLogMessage} from "@/api/generated/model";
import LogMessage from "@components/display/LogDisplay/LogMessage.tsx";

const LogDisplay = (props: { logMessages: GameServerLogMessage[] }) => {
  return <div className="border rounded-md p-4 bg-gray-900 text-white font-mono h-96 overflow-y-auto">
    {props.logMessages.map(logMessage => <LogMessage key={logMessage.uuid} message={logMessage}/>)}
  </div>
}

export default LogDisplay;
