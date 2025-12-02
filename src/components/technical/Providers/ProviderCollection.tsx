import CustomCursor from "@components/display/CustomCursor/CustomCursor.tsx";
import GlobalRightClickHandler from "@components/display/configurations/GlobalRightClickHandler/GlobalRightClickHandler.tsx";
import AuthProvider from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Toaster } from "@components/ui/sonner.tsx";
import { CursorifyProvider } from "@cursorify/react";
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
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default ProviderCollection;
