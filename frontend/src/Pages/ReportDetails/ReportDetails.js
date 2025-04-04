import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./ReportDetails.css"; // Add appropriate styles here

const ReportDetails = () => {
    const { id } = useParams();
    const [report, setReport] = useState(null);

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/report/${id}`
                );
                setReport(response.data);
            } catch (error) {
                console.error("Error fetching report details:", error);
            }
        };

        if (id) {
            fetchReportDetails();
        }
    }, [id]);

    return (
        <div className="container mt-5 mb-5 rd p-4">
            {report ? (
                <>
                    <h1 className="text-center mb-4 p-4">Report Details</h1>
                    <div className="row">
                        {/* Image Section */}
                        {Array.isArray(report.images) && report.images.length > 0 && (
                            <div className="col-lg-6 mb-4">
                                <h2 style={{ color: "white" }}>Uploaded Images</h2>
                                {report.images.map((image, index) => {
                                    const imageUrl = `${process.env.REACT_APP_API_BASE_URL}/uploads/${image}`;
                                    return (
                                        <div key={index}>
                                            <img
                                                src={imageUrl}
                                                alt={`Uploaded Image ${index + 1}`}
                                                className="img-fluid mb-3 rounded"
                                                style={{ maxWidth: "100%" }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Text Section */}
                        <div className="col-lg-6 pt-4">
                            <h4 style={{ color: "white" }}>Issue Category</h4>
                            <p style={{ color: "white" }}>{report.issueCategory}</p>

                            <h4 style={{ color: "white" }}>Issue Description</h4>
                            <p style={{ color: "white" }}>{report.issueDescription}</p>

                            <h4 style={{ color: "white" }}>Location</h4>
                            <p style={{ color: "white" }}>{report.location}</p>

                            {report.voiceDescription && (
                                <>
                                    <h4 style={{ color: "white" }}>Voice Transcription</h4>
                                    <p style={{ color: "white" }}>{report.voiceDescription}</p>
                                </>
                            )}

                            {/* Display the audio file (if exists) */}
                            {report.audio && (
                                <>
                                    <h4 style={{ color: "white" }}>Audio File</h4>
                                    <audio controls>
                                        <source
                                            src={`${process.env.REACT_APP_API_BASE_URL}/uploads/${report.audio}`}
                                            type="audio/wav"
                                        />
                                        Your browser does not support the audio element.
                                    </audio>
                                </>
                            )}

                            {/* Display other files (non-image) if present */}
                            {Array.isArray(report.selectedFiles) && report.selectedFiles.length > 0 && (
                                <>
                                    <h2 style={{ color: "white" }}>Uploaded Files</h2>
                                    {report.selectedFiles.map((file, index) => {
                                        const fileExtension = file.split('.').pop().toLowerCase();
                                        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                                        const isImage = imageExtensions.includes(fileExtension);

                                        return (
                                            <div key={index}>
                                                {isImage ? (
                                                    <img
                                                        src={`${process.env.REACT_APP_API_BASE_URL}/uploads/${file}`}
                                                        alt={`Uploaded File ${index + 1}`}
                                                        className="img-fluid mb-3 rounded"
                                                    />
                                                ) : (
                                                    <a style={{ color: "white" }}
                                                        href={`${process.env.REACT_APP_API_BASE_URL}/uploads/${file}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="d-block mb-3"
                                                    >
                                                        View File {index + 1}
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <p>Loading report details...</p>
            )}
        </div>
    );
};

export default ReportDetails;
