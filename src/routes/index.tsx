import {createFileRoute} from "@tanstack/react-router";
import GameServerConfigurationsDisplay
    from "@components/display/GameServerConfiguration/GameServerConfigurationsDisplay/GameServerConfigurationsDisplay.tsx";
import {useTypedSelector} from "@/stores/rootReducer.ts";
import bgImage from "@/assets/ai-generated/main-page/background.png"

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    const gameServers = useTypedSelector(
        state => state.gameServerConfigurationSliceReducer.data
    );

    return (
        <div
            className="
                  h-screen
                  w-screen
                  flex
                  flex-row
                  justify-center
                  items-center
            "

            style={{
                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                backgroundSize: '100% auto',
                backgroundPosition: 'center toppm run dev',
            }}
        >
            <GameServerConfigurationsDisplay gameServerConfigurations={gameServers}/>
        </div>
    );
}

export default Index;
