import { createContext, useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
} from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
  setLoading(true);

  try {
    const res = await getCurrentUser();

    setUser(res.data.user);
  } catch (err) {
    console.log(err);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  const login = async (values) => {
    await loginUser(values);
    await checkUser();
  };

  const register = async (values) => {
    await registerUser(values);
    await checkUser();
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};