import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ViewReports.css"; // Add appropriate styles here

const ViewReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Fetch all reports from the API
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reports`);
        console.log(response.data); // Log the response data to check if images are present
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="view-reports-container">
      <h1>All Reports</h1>
      <div className="reports-list">
        {reports.length > 0 ? (
          reports
            .slice() // Create a copy of the reports array to avoid mutating the original array
            .reverse() // Reverse the array to display the latest first
            .map((report) => (
              <div key={report._id} className="report-card">
                {/* Check if there are images and display them */}
                {report.images && report.images.length > 0 && (
                  <div className="image-container">
                    {report.images.map((image, index) => {
                      const imageUrl = `${process.env.REACT_APP_API_BASE_URL}/uploads/${image}`;
                      console.log(`Image URL: ${imageUrl}`); // Log the image URL for debugging
                      return (
                        <div key={index}>
                          <img
                            src={imageUrl}
                            alt={`Uploaded Image ${index + 1}`}
                            className="report-image"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Text section below the image */}
                <div className="report-details">
                  <h3>{report.issueCategory}</h3>
                  <p><strong>Location:</strong> {report.location}</p>
                  <Link to={`/report-details/${report._id}`} className="view-details-link">
                    View Details
                  </Link>
                </div>
              </div>
            ))
        ) : (
          <p>No reports available.</p>
        )}
      </div>
    </div>
  );
};

export default ViewReports;
