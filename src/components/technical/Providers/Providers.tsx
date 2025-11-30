import type {ReactNode} from "react";
import {Provider} from "react-redux";
import stores from "@/stores";
import AuthProvider from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {CursorifyProvider, DefaultCursor} from "@cursorify/react";
import CustomCursor from "@components/display/CustomCursor/CustomCursor.tsx";

const client = new QueryClient();

const Providers = (props: { children: ReactNode }) => {
    return <Provider store={stores}>
        <QueryClientProvider client={client}>
            <AuthProvider>
                <CursorifyProvider cursor={<CustomCursor/>}>
                    {props.children}
                </CursorifyProvider>
            </AuthProvider>
        </QueryClientProvider>
    </Provider>
}

export default Providers;