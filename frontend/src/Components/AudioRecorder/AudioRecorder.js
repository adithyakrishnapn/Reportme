import React, { useState, useRef } from "react";
import axios from "axios";

const AudioRecorder = ({ onTranscription, onAudioSave }) => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const fileInputRef = useRef(null);

  // Convert Audio Blob to Base64
  const convertAudioToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioType = "audio/wav";
        const blob = new Blob(audioChunks.current, { type: audioType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        // Save audio file to parent component
        if (onAudioSave) {
          // Create a File object from the Blob
          const audioFile = new File([blob], `recording-${Date.now()}.wav`, {
            type: audioType,
            lastModified: Date.now()
          });
          onAudioSave(audioFile);
        }

        // Transcribe Audio
        await transcribeAudioWithGoogle(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required to record audio.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Transcribe Audio with Google
  const transcribeAudioWithGoogle = async (audioFile) => {
    setIsProcessing(true);
    try {
      const base64Audio = await convertAudioToBase64(audioFile);

      const requestBody = {
        config: {
          encoding: "WEBM_OPUS", // Changed from LINEAR16 to match web recording format
          sampleRateHertz: 48000, // Most browsers use 48kHz
          languageCode: "en-US",
          model: "default", // Use default model
          enableAutomaticPunctuation: true
        },
        audio: {
          content: base64Audio,
        },
      };

      const API_KEY = process.env.REACT_APP_GOOGLE_SPEECH_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!API_KEY) {
        console.error("API Key is missing");
        alert("Google API Key is missing. Please check your environment variables.");
        setIsProcessing(false);
        return;
      }

      console.log("Sending transcription request to Google API...");
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
        requestBody
      );
      
      console.log("Google API response:", response.data);
      
      if (response.data.results && response.data.results.length > 0) {
        const transcript = response.data.results[0].alternatives[0].transcript;
        console.log("Transcription result:", transcript);
        onTranscription(transcript);
      } else {
        console.warn("No transcription result found");
        alert("No speech detected. Please try speaking clearly or uploading a different audio file.");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      
      // More detailed error handling
      if (error.response) {
        console.error("Response error data:", error.response.data);
        const errorMessage = error.response.data.error?.message || "Transcription failed";
        alert(`Transcription error: ${errorMessage}`);
      } else {
        alert("Transcription failed. Please check console for details and try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsProcessing(true);
      try {
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        // Save file to parent component
        if (onAudioSave) {
          onAudioSave(file);
        }

        // Transcribe Audio
        await transcribeAudioWithGoogle(blob);
      } catch (error) {
        console.error("Error processing audio file:", error);
        alert("Error processing audio file. Please try another file.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="audio-recorder">
      <div className="recorder-controls">
        <button 
          className={`btn ${isRecording ? "btn-danger" : "btn-success"}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        
        <button 
          className="btn btn-success mt-3" 
          onClick={() => fileInputRef.current.click()}
          disabled={isProcessing || isRecording}
          style={{ marginLeft: '10px' }}
        >
          Upload Audio
        </button>
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <p>Processing audio...</p>
        </div>
      )}

      {audioURL && (
        <div className="audio-preview" style={{ marginTop: '10px' }}>
          <audio controls src={audioURL} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;