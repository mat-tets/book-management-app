import { useEffect, useState } from "react";

import { authenticateToken, signInUser } from "../api/auth";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const storedToken = localStorage.getItem("token");

  // 初回リロード時の自動サインイン
  useEffect(() => {
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const result = await authenticateToken(storedToken);
        setUser(result.data.user);
        setToken(storedToken);
        console.log("自動ログイン成功");
      } catch (error) {
        console.log("自動ログイン失敗", error);
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [storedToken]);

  const signIn = async (signInData) => {
    const result = await signInUser(signInData);

    if (!result.success) {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      return result;
    }

    localStorage.setItem("token", result.data.token);
    setUser(result.data.user);
    setToken(result.data.token);
    return result;
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const updateUser = (nextUser) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return { ...prevUser, ...nextUser };
    });
  };

  return (
    <AuthContext
      value={{ user, token, signIn, signOut, isLoading, updateUser }}
    >
      {children}
    </AuthContext>
  );
};

export default AuthProvider;
