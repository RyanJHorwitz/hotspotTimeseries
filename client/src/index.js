import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 🌟 Add this line to handle local vs production backend routing
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App tabIndex={"-1"}/>
  </React.StrictMode>
);
