import React, { useState, useContext } from "react";
import LocationPicker from "../../Components/LocationPicker/LocationPicker";
import AudioRecorder from "../../Components/AudioRecorder/AudioRecorder";
import axios from "axios";
import AuthContext from "../../Contexts/AuthContext";
import "./Report.css";

const Report = () => {
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const [issueCategory, setIssueCategory] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [voiceDescription, setVoiceDescription] = useState(""); // Transcription Text
  const [location, setLocation] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFileChange = (event) => {
    const files = [...event.target.files];
    setSelectedFiles(files);
  };
  

  const handleAudioSave = (file) => {
    console.log("Audio file saved:", file);
    setAudioFile(file);
  };

  const handleTranscription = (text) => {
    console.log("Transcription received:", text);
    setVoiceDescription(text);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    // Ensure the userId exists in the context
    if (!user || !user._id) {
      setSubmitError("User ID not found. Please log in.");
      setIsSubmitting(false);
      return;
    }

    console.log("Submitting report for user ID:", user._id);
    console.log("Report data:", {
      issueCategory,
      issueDescription,
      voiceDescription,
      location,
      images: selectedFiles.length,
      audioFile: audioFile ? audioFile.name : null
    });

    // Validate location
    if (!location) {
      setSubmitError("Please select a location for the report");
      setIsSubmitting(false);
      return;
    }

    // Create a FormData object to send the files and other report data
    const formData = new FormData();
    formData.append("userId", user._id); // Add userId to the formData
    formData.append("issueCategory", issueCategory);
    formData.append("issueDescription", issueDescription);
    formData.append("voiceDescription", voiceDescription);
    formData.append("location", location);

    // Append files to the FormData object
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
    }
    
    if (audioFile) {
      formData.append("audio", audioFile);
    }

    try {
      // Log FormData contents (for debugging)
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/report`, 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );
      
      console.log("Report submitted successfully:", response.data);
      setSubmitSuccess(true);
      
      // Reset form
      setIssueCategory("");
      setIssueDescription("");
      setVoiceDescription("");
      setLocation("");
      setSelectedFiles([]);
      setAudioFile(null);
      
    } catch (error) {
      console.error("Error submitting report:", error);
      
      if (error.response) {
        setSubmitError(`Error: ${error.response.data.message || error.response.statusText || "Server error"}`);
      } else if (error.request) {
        setSubmitError("No response from server. Please check your connection and try again.");
      } else {
        setSubmitError(`Error: ${error.message || "Failed to submit the report"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <main className="report-container">
        <div className="report-form-container">
          <h1>Report an Issue</h1>
          <p className="report-subtitle">
            Report community issues quickly and easily with our intuitive form.
          </p>

          {submitSuccess && (
            <div className="alert alert-success">
              Report submitted successfully! Thank you for your contribution.
            </div>
          )}

          {submitError && (
            <div className="alert alert-danger">
              {submitError}
            </div>
          )}

          <form id="issueReportForm" className="report-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-section">
                <h2>Issue Details</h2>

                <div className="form-group">
                  <label htmlFor="issueCategory">Issue Category</label>
                  <select
                    id="issueCategory"
                    name="issueCategory"
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select...</option>
                    <option value="pothole">Pothole</option>
                    <option value="streetlight">Streetlight</option>
                    <option value="graffiti">Graffiti</option>
                    <option value="trash">Trash/Debris</option>
                    <option value="sidewalk">Sidewalk Damage</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="issueDescription">Issue Description</label>
                  <textarea
                    id="issueDescription"
                    name="issueDescription"
                    placeholder="Describe the issue in detail..."
                    rows="5"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <LocationPicker onLocationSelect={setLocation} />
                  {location && (
                    <div className="selected-location">
                      <p><strong>Selected:</strong> {location}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h2>Upload Media</h2>

                <div className="form-group">
                  <label>Audio Recording</label>
                  <AudioRecorder 
                    onTranscription={handleTranscription} 
                    onAudioSave={handleAudioSave} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="voiceDescription">Voice Description</label>
                  <textarea
                    id="voiceDescription"
                    name="voiceDescription"
                    placeholder="Voice transcription will appear here..."
                    rows="4"
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
  <label>Photo Upload</label>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleFileChange}
  />
  {selectedFiles.length > 0 && (
    <div className="file-preview">
      <p>{selectedFiles.length} file(s) selected</p>
      <div className="image-previews">
        {selectedFiles.map((file, index) => (
          <div key={index} className="image-preview">
            <img
              src={URL.createObjectURL(file)}
              alt={`preview-${index}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <p>{file.name}</p>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

              </div>
            </div>

            <div className="form-submit">
              <button 
                type="submit" 
                id="submitBtn" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Report;