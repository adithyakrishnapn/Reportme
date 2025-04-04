import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthContext from "../../Contexts/AuthContext";
import "./Account.css"; // Add appropriate styles here

const Account = () => {
  const [reports, setReports] = useState([]);
  const { user } = useContext(AuthContext); // Get user from AuthContext

  // Fetch user details and their reports
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        return; // No user data yet, so no need to fetch anything
      }

      try {
        // Fetch the reports posted by the user using user._id
        const reportsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user-reports/${user._id}`);
        setReports(reportsResponse.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchUserData();
  }, [user]); // Re-run the effect whenever the user changes

  // Handle report deletion
  const deleteReport = async (reportId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/reports/${reportId}`, {
        data: { userId: user._id } // Send userId in request body
      });
      setReports(reports.filter(report => report._id !== reportId));
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div className="container-fluid act">
    <div className="account-container">
      {user ? (
        <>
          <div className="account-header">
            <h1>Welcome, {user.name}</h1>
            <p>Manage your reports below:</p>
          </div>

          <div className="user-reports">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report._id} className="report-card">
                  <div className="report-card-header">
                    <h3>{report.issueCategory}</h3>
                    <button
                      onClick={() => deleteReport(report._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                  <p><strong>Location:</strong> {report.location}</p>
                  <Link to={`/report-details/${report._id}`} className="view-details-link">
                    View Details
                  </Link>
                </div>
              ))
            ) : (
              <p>You have not posted any reports yet.</p>
            )}
          </div>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
    </div>
  );
};

export default Account;
