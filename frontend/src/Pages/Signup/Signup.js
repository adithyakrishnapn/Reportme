import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // Handle Normal Sign-Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_CREATE_USER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        console.log("User saved in MongoDB:", data);
        alert("Signup successful! Please login.");
        navigate("/login"); // Redirect to login page
      } else {
        if (response.status === 400 && data.message === "User already exists") {
          alert("Email already exists. Please use a different email.");
        } else {
          alert(data.message || "Signup failed. Try again.");
        }
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
      alert("Signup failed. Please check your details.");
    }
  };
  

  return (
    <div className="signupPage">
      <div className="signupCard">
        <h2 className="signupHeading">Create Your Account</h2>
        <form className="signupForm" onSubmit={handleSignUp}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
