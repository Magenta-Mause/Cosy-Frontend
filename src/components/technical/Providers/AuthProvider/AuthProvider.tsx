import WebSocketCollection from "@components/technical/WebsocketCollection/WebSocketCollection.tsx";
import {jwtDecode} from "jwt-decode";
import {createContext, type ReactNode, useCallback, useEffect, useState} from "react";
import {StompSessionProvider} from "react-stomp-hooks";
import SockJS from "sockjs-client";
import {setAuthToken} from "@/api/axiosInstance";
import {fetchToken, logout} from "@/api/generated/backend-api";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";
import config from "@config";

interface AuthContextType {
  identityToken: string | null;
  authorized: boolean | null;
  tokenExpirationDate: number | null;
  username: string | null;
  refreshIdentityToken: () => void;
  setToken: (token: string) => void;
  handleLogout: () => void;
}

interface DecodedToken {
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  tokenType: "REFRESH_TOKEN" | "IDENTITY_TOKEN";
}

const AuthContext = createContext<AuthContextType>({
  identityToken: null,
  authorized: null,
  tokenExpirationDate: null,
  username: null,
  refreshIdentityToken() {
    console.warn("Called refresh identity token before auth context ready");
  },
  setToken() {
    console.warn("Called setToken before auth context ready");
  },
  handleLogout() {
    console.warn("Called logout before auth context ready");
  },
});

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;

const AuthProvider = (props: { children: ReactNode }) => {
  const {loadAllData} = useDataLoading();
  const [username, setUsername] = useState<string | null>(null);
  const [identityToken, setIdentityToken] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState<number | null>(null);

  const parseToken = useCallback((token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }, []);

  const analyseToken = useCallback(
    (token: string | null) => {
      const emptyResponse = {
        identityToken: null,
        authorized: false,
        username: null,
        tokenExpirationDate: null,
      };
      if (!token) {
        return emptyResponse;
      }
      const decoded = parseToken(token);
      if (!decoded) {
        return emptyResponse;
      }
      const expirationMs = decoded.exp * 1000;
      const isExpired = Date.now() >= expirationMs;

      if (isExpired) {
        return emptyResponse;
      }

      return {
        identityToken: token,
        authorized: true,
        username: decoded.sub,
        tokenExpirationDate: expirationMs,
      };
    },
    [parseToken],
  );
  const updateAuthState = useCallback(
    (token: string | null) => {
      const response = analyseToken(token);
      setIdentityToken(response.identityToken);
      setAuthorized(response.authorized);
      setUsername(response.username);
      setTokenExpirationDate(response.tokenExpirationDate);
    },
    [analyseToken],
  );

  const refreshIdentityToken = useCallback(async () => {
    try {
      const token = await fetchToken();

      if (token) {
        updateAuthState(token);
        setAuthToken(token);
        return token;
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      updateAuthState(null);
    }
  }, [updateAuthState]);

  const handleLogout = useCallback(() => {
    updateAuthState(null);
    setAuthToken(null);
    logout();
  }, [updateAuthState]);

  const setToken = useCallback(
    (token: string) => {
      updateAuthState(token);
      setAuthToken(token);
    },
    [updateAuthState],
  );

  useEffect(() => {
    refreshIdentityToken();
  }, [refreshIdentityToken]);

  useEffect(() => {
    if (!tokenExpirationDate) return;

    const timeUntilRefresh = tokenExpirationDate - Date.now() - TOKEN_REFRESH_BUFFER;

    if (timeUntilRefresh <= 0) {
      refreshIdentityToken();
      return;
    }

    const timerId = setTimeout(() => {
      refreshIdentityToken();
    }, timeUntilRefresh);

    return () => clearTimeout(timerId);
  }, [tokenExpirationDate, refreshIdentityToken]);

  useEffect(() => {
    if (authorized) {
      loadAllData();
    }
  }, [authorized, loadAllData]);

  return (
    <AuthContext.Provider
      value={{
        identityToken,
        authorized,
        tokenExpirationDate,
        username,
        refreshIdentityToken,
        setToken,
        handleLogout,
      }}
    >
      <StompSessionProvider
        url={config.backendBrokerUrl}
        webSocketFactory={() => {
          return new SockJS(`${config.websocketFactory}${identityToken ? `?authToken=${identityToken}` : ``}`);
        }}
      >
        <WebSocketCollection/>
        {props.children}
      </StompSessionProvider>
    </AuthContext.Provider>
  );
};

export {AuthContext};
export default AuthProvider;
