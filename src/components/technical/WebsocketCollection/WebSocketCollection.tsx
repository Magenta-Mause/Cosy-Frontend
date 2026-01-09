import {useSubscription} from "react-stomp-hooks";
import {useTypedSelector} from "@/stores/rootReducer.ts";
import {useDispatch} from "react-redux";
import {gameServerLogSliceActions} from "@/stores/slices/gameServerLogSlice.ts";

const WebSocketCollection = () => {
  const gameServer = useTypedSelector(state => state.gameServerSliceReducer.data);
  const dispatch = useDispatch();

  useSubscription(gameServer ? gameServer.map(server => `/topics/game-server-logs/creation/${server.uuid}`) : [], (message) => {
    const messageBody = JSON.parse(message.body);
    console.log("adding:", messageBody);
    dispatch(gameServerLogSliceActions.addLog(messageBody));
  })
  return <></>
}

export default WebSocketCollection;
