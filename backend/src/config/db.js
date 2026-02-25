const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    return prisma;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.error("Please check your DATABASE_URL in .env file");
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
  }
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
};
