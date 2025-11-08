// components/AlertCard.jsx
import React from "react";
import warningIcon from "../assets/warning-icon.png"; // use your icon

const AlertCard = ({ message }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    background: "#fff3cd",
    border: "1px solid #ffeeba",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    maxWidth: "80%",
    margin: "1rem auto",
    fontWeight: "bold"
  }}>
    <img src={warningIcon} alt="Warning" width={40} />
    <p>{message}</p>
  </div>
);

export default AlertCard;
