const app = require("./app");
require("dotenv").config();
const { disconnectDB } = require("./config/db"); // Import disconnectDB

const PORT = process.env.PORT || 5001;

//  await connectDB();
const server = app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`); // ${PORT} is template string
});

// Handle unhandled promise rejections (e.g., database connection errors)
// so in this part, if there is unhandled rejection, it will log the error and close the server and disconnect from database
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    const { disconnectDB } = require("./config/db.js");
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
// so this part will catch any uncaught exceptions in the application, log the error, disconnect from the database, and exit the process
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  const { disconnectDB } = require("./config/db.js");
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown on SIGTERM and SIGINT
// this part will handle graceful shutdown when the application receives a SIGTERM or SIGINT signal
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(async () => {
    const { disconnectDB } = require("./config/db.js");
    await disconnectDB();
    process.exit(0);
  });
});
