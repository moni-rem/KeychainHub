// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend API base URL
  withCredentials: true, // if you use cookies/auth
});

export default api;
