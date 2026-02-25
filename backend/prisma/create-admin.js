const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const createAdmin = async () => {
  console.log("👑 Creating admin...");

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Clear existing admin (if any)
    await prisma.admin.deleteMany();

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: "superadmin@test.com",
        password: hashedPassword,
        name: "Super Admin",
      },
    });

    console.log("\n✅ ADMIN CREATED SUCCESSFULLY!");
    console.log("=================================");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: password123`);
    console.log(`🆔 Admin ID: ${admin.id}`);
    console.log("=================================");
    console.log("\nCopy this ID to use in your main seed file!");

    return admin.id;
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();
