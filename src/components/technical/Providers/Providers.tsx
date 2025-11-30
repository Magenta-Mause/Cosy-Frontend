import type {ReactNode} from "react";
import {Provider} from "react-redux";
import stores from "@/stores";
import AuthProvider from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";

const Providers = (props: { children: ReactNode }) => {
  return <Provider store={stores}>
    <AuthProvider>
      {props.children}
    </AuthProvider>
  </Provider>
}

export default Providers;
