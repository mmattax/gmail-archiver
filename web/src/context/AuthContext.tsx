import React, { useCallback, useEffect } from "react";
import api from "../api";
interface AuthContextType {
  loading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType>({
  loading: true,
  token: null,
  setToken: (token: string | null) => {},
  currentUser: null,
  setCurrentUser: (user: any | null) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: any) => {
  const [loading, setLoading] = React.useState(true);
  const [token, setToken] = React.useState(
    window.localStorage.getItem("idToken")
  );
  const [currentUser, setCurrentUser] = React.useState(null);

  const tokenSetter = useCallback(
    (token: string | null) => {
      if (token != null) {
        window.localStorage.setItem("idToken", token);
        setToken(token);
      } else {
        window.localStorage.removeItem("idToken");
        setToken(null);
      }
    },
    [setToken]
  );

  const logout = () => {
    tokenSetter(null);
    setCurrentUser(null);
  };

  useEffect(() => {
    setLoading(true);
    if (token) {
      console.log("token changed, fetching user");
      api
        .get("/me")
        .then((res) => {
          setCurrentUser(res.data.user);
        })
        .catch(() => {
          window.localStorage.removeItem("idToken");
          setCurrentUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        token,
        setToken: tokenSetter,
        currentUser,
        setCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
