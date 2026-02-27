import AuthProvider from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { NotificationModalProvider } from "./NotificationModalProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import stores from "@/stores";

const client = new QueryClient();

const ProviderCollection = (props: { children: ReactNode }) => {
  return (
    <Provider store={stores}>
      <QueryClientProvider client={client}>
        <AuthProvider>
          {props.children}
          <NotificationModalProvider />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default ProviderCollection;
