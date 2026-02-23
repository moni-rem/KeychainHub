const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// const userId = "cmlaj17f60000j9o2m2fd5ur9"; // Replace with an actual user ID from my database

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("✅ Cleared existing data");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        email: "admin@keychain.com",
        password: adminPassword,
        name: "Admin User",
        isAdmin: true,
        phone: "+1234567890",
        address: "123 Admin Street",
      },
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create regular users
    const users = [];
    for (let i = 1; i <= 3; i++) {
      const password = await bcrypt.hash(`user${i}@123`, 10);
      const user = await prisma.user.create({
        data: {
          email: `user${i}@example.com`,
          password: password,
          name: `User ${i}`,
          phone: `+123456789${i}`,
          address: `${i} User Street`,
        },
      });
      users.push(user);
      console.log(`✅ User created: ${user.email}`);
    }

    // Create carts for all users
    const allUsers = [admin, ...users];
    for (const user of allUsers) {
      await prisma.cart.create({
        data: { userId: user.id },
      });
    }
    console.log("✅ Carts created for all users");

    // Create product categories
    const categories = ["Anime", "Games", "Movies", "Custom", "Animals"];

    // Create sample products
    const products = [
      {
        name: "Naruto Keychain",
        description: "High-quality Naruto Uzumaki keychain",
        price: 12.99,
        stock: 100,
        category: "Anime",
        isFeatured: true,
        images: ["/uploads/products/naruto.jpg"],
      },
      {
        name: "Minecraft Creeper Keychain",
        description: "Glow in the dark Creeper keychain",
        price: 9.99,
        stock: 75,
        category: "Games",
        isFeatured: true,
        images: ["/uploads/products/minecraft.jpg"],
      },
      {
        name: "Star Wars Lightsaber",
        description: "LED lightsaber keychain",
        price: 14.99,
        stock: 50,
        category: "Movies",
        isFeatured: false,
        images: ["/uploads/products/starwars.jpg"],
      },
      {
        name: "Custom Name Keychain",
        description: "Personalized keychain with your name",
        price: 8.99,
        stock: 200,
        category: "Custom",
        isFeatured: true,
        images: ["/uploads/products/custom.jpg"],
      },
      {
        name: "Cat Keychain",
        description: "Adorable cat keychain with moving parts",
        price: 7.99,
        stock: 150,
        category: "Animals",
        isFeatured: false,
        images: ["/uploads/products/cat.jpg"],
      },
      // Additional Anime products
      {
        name: "Dragon Ball Z Keychain",
        description: "Goku Super Saiyan keychain with energy effect",
        price: 13.99,
        stock: 80,
        category: "Anime",
        isFeatured: true,
        images: ["/uploads/products/dragonball.jpg"],
      },
      {
        name: "Attack on Titan Keychain",
        description: "Survey Corps emblem keychain",
        price: 11.99,
        stock: 60,
        category: "Anime",
        isFeatured: false,
        images: ["/uploads/products/aot.jpg"],
      },
      {
        name: "One Piece Keychain",
        description: "Straw Hat Pirates logo keychain",
        price: 10.99,
        stock: 90,
        category: "Anime",
        isFeatured: false,
        images: ["/uploads/products/onepiece.jpg"],
      },
      {
        name: "My Hero Academia Keychain",
        description: "Deku hero costume keychain",
        price: 12.49,
        stock: 70,
        category: "Anime",
        isFeatured: true,
        images: ["/uploads/products/mha.jpg"],
      },
      // Additional Games products
      {
        name: "Pokemon Pikachu Keychain",
        description: "Light-up Pikachu keychain with sound",
        price: 11.99,
        stock: 120,
        category: "Games",
        isFeatured: true,
        images: ["/uploads/products/pikachu.jpg"],
      },
      {
        name: "Super Mario Mushroom Keychain",
        description: "Classic Super Mushroom with LED light",
        price: 9.49,
        stock: 100,
        category: "Games",
        isFeatured: false,
        images: ["/uploads/products/mario.jpg"],
      },
      {
        name: "Zelda Triforce Keychain",
        description: "Golden Triforce symbol keychain",
        price: 10.99,
        stock: 85,
        category: "Games",
        isFeatured: false,
        images: ["/uploads/products/zelda.jpg"],
      },
      {
        name: "Among Us Crewmate Keychain",
        description: "Red Crewmate with customizable hat",
        price: 8.99,
        stock: 140,
        category: "Games",
        isFeatured: false,
        images: ["/uploads/products/amongus.jpg"],
      },
      // Additional Movies products
      {
        name: "Harry Potter Wand Keychain",
        description: "Mini replica of Harry's wand with LED tip",
        price: 13.99,
        stock: 65,
        category: "Movies",
        isFeatured: true,
        images: ["/uploads/products/hp-wand.jpg"],
      },
      {
        name: "Marvel Avengers Keychain",
        description: "Avengers logo keychain with metallic finish",
        price: 11.99,
        stock: 95,
        category: "Movies",
        isFeatured: false,
        images: ["/uploads/products/avengers.jpg"],
      },
      {
        name: "Batman Logo Keychain",
        description: "Glowing Batman symbol keychain",
        price: 10.49,
        stock: 75,
        category: "Movies",
        isFeatured: false,
        images: ["/uploads/products/batman.jpg"],
      },
      {
        name: "Minion Keychain",
        description: "Stuart minion with goggles keychain",
        price: 9.99,
        stock: 110,
        category: "Movies",
        isFeatured: false,
        images: ["/uploads/products/minion.jpg"],
      },
      // Additional Custom products
      {
        name: "Photo Keychain",
        description: "Digital photo frame keychain",
        price: 15.99,
        stock: 50,
        category: "Custom",
        isFeatured: true,
        images: ["/uploads/products/photo.jpg"],
      },
      {
        name: "Engraved Message Keychain",
        description: "Custom engraved message keychain",
        price: 10.99,
        stock: 80,
        category: "Custom",
        isFeatured: false,
        images: ["/uploads/products/engraved.jpg"],
      },
      {
        name: "Birthstone Keychain",
        description: "Personalized birthstone keychain",
        price: 12.99,
        stock: 70,
        category: "Custom",
        isFeatured: false,
        images: ["/uploads/products/birthstone.jpg"],
      },
      {
        name: "LED Message Keychain",
        description: "Programmable LED scrolling message keychain",
        price: 13.49,
        stock: 60,
        category: "Custom",
        isFeatured: true,
        images: ["/uploads/products/led-message.jpg"],
      },
      // Additional Animals products
      {
        name: "Dog Keychain",
        description: "Golden Retriever puppy keychain",
        price: 8.99,
        stock: 130,
        category: "Animals",
        isFeatured: false,
        images: ["/uploads/products/dog.jpg"],
      },
      {
        name: "Elephant Keychain",
        description: "Elephant family keychain with trunk up",
        price: 9.49,
        stock: 90,
        category: "Animals",
        isFeatured: false,
        images: ["/uploads/products/elephant.jpg"],
      },
      {
        name: "Dolphin Keychain",
        description: "Jumping dolphin keychain with blue gem",
        price: 10.99,
        stock: 85,
        category: "Animals",
        isFeatured: false,
        images: ["/uploads/products/dolphin.jpg"],
      },
      {
        name: "Owl Keychain",
        description: "Wise owl keychain with moving eyes",
        price: 9.99,
        stock: 100,
        category: "Animals",
        isFeatured: false,
        images: ["/uploads/products/owl.jpg"],
      },
    ];

    // Insert all products
    for (const productData of products) {
      await prisma.product.create({
        data: productData,
      });
    }
    console.log(`✅ ${products.length} products created`);

    // Create sample orders for regular users
    const allProducts = await prisma.product.findMany();

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (allProducts.length >= 2) {
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            total: 45.97,
            status: i === 0 ? "delivered" : "pending",
            address: user.address,
            phone: user.phone,
            notes: i === 0 ? "Left at front door" : null,
            items: {
              create: [
                {
                  productId: allProducts[0].id,
                  quantity: 2,
                  price: allProducts[0].price,
                },
                {
                  productId: allProducts[1].id,
                  quantity: 1,
                  price: allProducts[1].price,
                },
              ],
            },
          },
        });
        console.log(
          `✅ Order created for ${user.email}: ${order.id.slice(0, 8)}`,
        );
      }
    }

    console.log("🎉 Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
