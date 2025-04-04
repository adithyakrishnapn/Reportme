import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Signup from "./Pages/Signup/Signup";
import Login from "./Pages/Login/Login";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import About from "./Pages/About/About";
import { AuthContext, AuthProvider } from "./Contexts/AuthContext";
import PrivateRoute from "./Contexts/PrivateRoute";
import Report from "./Pages/Report/Report";
import ViewReports from "./Pages/ViewReports/ViewReports";
import ReportDetails from "./Pages/ReportDetails/ReportDetails";
import Account from "./Pages/Account/Account";
import Dashboard from "./Pages/Dashboard/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Redirect logged-in users away from signup and login */}
          <Route
            path="/signup"
            element={
              <RedirectIfAuthenticated>
                <Signup />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />

          <Route path="/view-reports" element={<ViewReports />} />
          <Route path="/report-details/:id" element={<ReportDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Protected Route: Only logged-in users can access Report */}
          <Route element={<PrivateRoute />}>
            <Route path="/report" element={<Report />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

// Component to redirect authenticated users away from login/signup pages
function RedirectIfAuthenticated({ children }) {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/" replace /> : children;
}

export default App;
