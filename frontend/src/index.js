import React from 'react';
import ReactDOM from 'react-dom/client';  // Use 'react-dom/client' in React 18
import App from './App';
import { AuthProvider } from './Contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

// Create a root for React 18
const root = ReactDOM.createRoot(document.getElementById('root')); 

// Render the application
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
