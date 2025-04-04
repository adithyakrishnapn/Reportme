import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create AuthContext with null defaults
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      fetchUser(userEmail);
    }
  }, []);

  const fetchUser = async (email) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/fetch-user/${email}`);
      if (res.data) {
        setUser(res.data);  // Ensure user has '_id'
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:3001/api/fetch-user", { email, password });

      if (res.data) {
        localStorage.setItem("userEmail", res.data.email);
        setUser(res.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
