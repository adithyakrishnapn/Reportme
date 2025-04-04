import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../Contexts/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bgchange"
    style={{ backgroundColor: 'black', color: 'white' }}  >
    <div className="container-fluid bgchange">
    <Link className="navbar-brand" to="/">ReportMe</Link>
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav ms-auto">
        <li className="nav-item">
          <NavLink to="/about" className="nav-link">About</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/report" className="nav-link">Report</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/view-reports" className="nav-link">View Reports</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/dashboard" className="nav-link">Heatmap</NavLink>
        </li>
        {user ? (
          <>
            <li className="nav-item">
              <NavLink to="/account" className="nav-link">
                <FontAwesomeIcon icon={faUser} size="lg" /> Account
              </NavLink>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#" onClick={logout}>
                LogOut
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <NavLink to="/signup" className="nav-link">Signup</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/login" className="nav-link">Login</NavLink>
            </li>
          </>
        )}
      </ul>
    </div>
  </div>
</nav>

  );
}

export default Navbar;
