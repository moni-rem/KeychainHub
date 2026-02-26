const prisma = require("../config/prisma");
const User = require("./user");
const Order = require("./order");

const db = {
  prisma,
  User,
  Order,
};

const initDB = async () => {
  try {
    await prisma.$connect();
    console.log(
      "✅ Database connection established successfully with Neon PostgreSQL",
    );
    console.log("✅ Database models ready");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};

module.exports = {
  ...db,
  initDB,
  default: db,
};
