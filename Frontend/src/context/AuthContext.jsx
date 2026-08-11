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

  const res = await loginUser(values);

  console.log("LOGIN RESPONSE:", res.data);

  localStorage.setItem("token", res.data.token);

  console.log("TOKEN SAVED:", localStorage.getItem("token"));

  await checkUser();

};

 const register = async (values) => {

  const res = await registerUser(values);

  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }

  await checkUser();

};

  const logout = async () => {

  await logoutUser();

  localStorage.removeItem("token");

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