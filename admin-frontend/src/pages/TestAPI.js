import React, { useState, useEffect } from "react";
import api from "../services/api";

function TestAPI() {
  const [status, setStatus] = useState("Testing...");
  const [data, setData] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get("/test");
        setStatus("✅ Connected to backend!");
        setData(response);
      } catch (error) {
        setStatus("❌ Failed to connect to backend");
        console.error(error);
      }
    };
    testConnection();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>API Connection Test</h2>
      <p>Status: {status}</p>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default TestAPI;
