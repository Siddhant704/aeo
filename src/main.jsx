import React from "react";
import ReactDOM from "react-dom/client";
import App from "../thali-wellness-app.jsx";
import "./index.css";

/* The app expects a host-provided window.storage. Outside that host, back it
   with localStorage so meals, bookings and vitals still persist locally. */
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(`thali:${key}`);
      return value === null ? null : { value };
    },
    async set(key, value) {
      localStorage.setItem(`thali:${key}`, value);
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
