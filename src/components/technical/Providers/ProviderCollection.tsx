import AuthProvider from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import {Toaster} from "@components/ui/sonner.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactNode} from "react";
import {Provider} from "react-redux";
import stores from "@/stores";
import {StompSessionProvider} from "react-stomp-hooks";

const client = new QueryClient();

const ProviderCollection = (props: { children: ReactNode }) => {
  return (
    <Provider store={stores}>
      <QueryClientProvider client={client}>
        <StompSessionProvider url={"/api/v1/ws"}>
          <AuthProvider>
            {props.children}
            <Toaster toastOptions={{duration: 2000, className: "font-['VT323']"}}/>
          </AuthProvider>
        </StompSessionProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default ProviderCollection;
