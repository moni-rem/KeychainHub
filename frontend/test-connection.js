// Run this with: node test-connection.js
const http = require("http");

const options = {
  hostname: "localhost",
  port: 5001,
  path: "/api/products",
  method: "GET",
  timeout: 2000,
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is running on port 5001`);
  console.log(`Status Code: ${res.statusCode}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("Response:", JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("Raw response:", data.substring(0, 200));
    }
  });
});

req.on("error", (error) => {
  console.error(`❌ Cannot connect to backend on port 5001`);
  console.error("Error:", error.message);
  console.error("\nMake sure your backend is running with:");
  console.error("  cd backend");
  console.error("  npm run dev");
});

req.end();
