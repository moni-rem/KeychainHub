const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Your admin ID
const adminId = "863b69c2-c311-46f1-a121-7b91d775e699";

// All 16 product images
const productImages = [
  "https://t3.ftcdn.net/jpg/08/94/31/98/240_F_894319893_11ZJ7cSyn5H45Pv0zOMFFUEMqbPrjkwV.jpg",
  "https://t4.ftcdn.net/jpg/16/50/56/53/240_F_1650565356_O9JY2t8QNDENbAnms5wfRe5HArf2CgV8.jpg",
  "https://t4.ftcdn.net/jpg/06/81/88/79/240_F_681887953_VKcerit0Hu03VefTY9vJXWJbXnAE5M2F.jpg",
  "https://t4.ftcdn.net/jpg/14/94/67/99/240_F_1494679978_tskvsmntHfAE2mDBgLe61h1nUCPPfXfk.jpg",
  "https://t4.ftcdn.net/jpg/09/84/25/97/240_F_984259712_ZNOw4VhkdGlaUNZRG6EBBnTdzjWpGD7M.jpg",
  "https://t3.ftcdn.net/jpg/10/74/82/84/240_F_1074828468_hLX6Knatzf9tk2GSDRE4uZvi4X2fGxkY.jpg",
  "https://t4.ftcdn.net/jpg/14/98/75/31/240_F_1498753190_bQM2cQoVkQuL4aKRSfpw1E4a6iqJ2nG5.jpg",
  "https://t4.ftcdn.net/jpg/09/54/56/79/240_F_954567954_XYIIfjlDC7sv1t5QYIgoWx3iBw8S90h3.jpg",
  "https://t3.ftcdn.net/jpg/11/53/90/90/240_F_1153909028_ozDQSA9GhRg6DWPm5olXT5LNlM95RuWR.jpg",
  "https://t4.ftcdn.net/jpg/16/47/47/33/240_F_1647473331_AAofIIvn5s5vtX9hkxYiFvhbpUGkGu5j.jpg",
  "https://t4.ftcdn.net/jpg/11/87/13/81/240_F_1187138120_DlM7aHDTjr0mIKhhrlhj78QjxAXx2gxF.jpg",
  "https://t3.ftcdn.net/jpg/02/66/88/54/240_F_266885446_gROe3m3qD4J6NlB0oueTyCzNnRDjGZdn.jpg",
  "https://t3.ftcdn.net/jpg/17/75/48/42/240_F_1775484291_pMJ5hxo2NJh6sq48yWJ18GEc1jLE2yx3.jpg",
  "https://t4.ftcdn.net/jpg/12/60/71/95/240_F_1260719594_CW3TmGcw9uOn0RddWfPq7jOSLt3al2La.jpg",
  "https://t3.ftcdn.net/jpg/03/80/20/18/240_F_380201883_TZCIIdTxeRgvYZtxeZZ638J1L1OOTi8n.jpg",
  "https://t4.ftcdn.net/jpg/17/43/75/19/240_F_1743751954_mD39dpc61xBNfw2xsMhc7X8zLUrCUMgQ.jpg",
];

// User data
const users = [
  {
    email: "user1@example.com",
    name: "John Doe",
    phone: "+1-212-555-1234",
    address: "123 Main St, New York, NY 10001",
    isAdmin: true,
  },
  {
    email: "user2@example.com",
    name: "Jane Smith",
    phone: "+1-310-555-5678",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    isAdmin: true,
  },
  {
    email: "user3@example.com",
    name: "Bob Johnson",
    phone: "+1-312-555-9012",
    address: "789 Pine Rd, Chicago, IL 60601",
    isAdmin: false,
  },
  {
    email: "user4@example.com",
    name: "Alice Brown",
    phone: "+1-713-555-3456",
    address: "321 Elm St, Houston, TX 77001",
    isAdmin: false,
  },
  {
    email: "user5@example.com",
    name: "Charlie Wilson",
    phone: "+1-602-555-7890",
    address: "654 Maple Dr, Phoenix, AZ 85001",
    isAdmin: false,
  },
  {
    email: "user6@example.com",
    name: "Diana Prince",
    phone: "+1-215-555-2345",
    address: "987 Cedar Ln, Philadelphia, PA 19101",
    isAdmin: false,
  },
  {
    email: "user7@example.com",
    name: "Edward Norton",
    phone: "+1-210-555-6789",
    address: "147 Birch Blvd, San Antonio, TX 78201",
    isAdmin: false,
  },
  {
    email: "user8@example.com",
    name: "Fiona Apple",
    phone: "+1-619-555-0123",
    address: "258 Spruce Way, San Diego, CA 92101",
    isAdmin: false,
  },
  {
    email: "user9@example.com",
    name: "George Clooney",
    phone: "+1-214-555-4567",
    address: "369 Willow Ct, Dallas, TX 75201",
    isAdmin: false,
  },
  {
    email: "user10@example.com",
    name: "Hannah Montana",
    phone: "+1-408-555-8901",
    address: "741 Ash Ave, San Jose, CA 95101",
    isAdmin: false,
  },
];

// Products array (20 products)
const products = [
  {
    name: "Vintage Compass Keychain",
    description:
      "High-quality vintage compass keychain made from brass. Perfect for travelers and adventurers.",
    price: 12.99,
    stock: 45,
    category: "Metal",
    color: "Gold",
    material: "Brass",
    sku: "KC-001",
    isFeatured: true,
  },
  {
    name: "Leather Tassel Keychain",
    description:
      "Elegant leather tassel keychain in genuine leather. Adds a touch of class to your keys.",
    price: 15.99,
    stock: 32,
    category: "Leather",
    color: "Brown",
    material: "Leather",
    sku: "KC-002",
    isFeatured: true,
  },
  {
    name: "Metal Bottle Opener Keychain",
    description:
      "Stainless steel bottle opener keychain - never miss a chance to open a cold one.",
    price: 8.99,
    stock: 78,
    category: "Metal",
    color: "Silver",
    material: "Stainless Steel",
    sku: "KC-003",
    isFeatured: true,
  },
  {
    name: "Personalized Name Keychain",
    description:
      "Custom engraved name keychain. Makes a perfect gift for any occasion.",
    price: 11.99,
    stock: 56,
    category: "Acrylic",
    color: "Red",
    material: "Acrylic",
    sku: "KC-004",
    isFeatured: true,
  },
  {
    name: "Heart Shape Keychain",
    description:
      "Romantic heart-shaped keychain. Perfect for couples and anniversaries.",
    price: 6.99,
    stock: 92,
    category: "Metal",
    color: "Gold",
    material: "Aluminum",
    sku: "KC-005",
    isFeatured: true,
  },
  {
    name: "Star Wars Darth Vader Keychain",
    description:
      "Official Star Wars Darth Vader keychain. May the force be with you.",
    price: 14.99,
    stock: 23,
    category: "Plastic",
    color: "Black",
    material: "Plastic",
    sku: "KC-006",
    isFeatured: false,
  },
  {
    name: "Mini Flashlight Keychain",
    description:
      "LED mini flashlight keychain. Super bright and long-lasting battery.",
    price: 7.99,
    stock: 67,
    category: "Plastic",
    color: "Blue",
    material: "Plastic",
    sku: "KC-007",
    isFeatured: false,
  },
  {
    name: "Retro Camera Keychain",
    description:
      "Vintage camera design keychain. Great for photography enthusiasts.",
    price: 9.99,
    stock: 41,
    category: "Metal",
    color: "Black",
    material: "Zinc Alloy",
    sku: "KC-008",
    isFeatured: false,
  },
  {
    name: "Wooden Elephant Keychain",
    description:
      "Hand-carved wooden elephant keychain. Brings good luck and fortune.",
    price: 10.99,
    stock: 34,
    category: "Wood",
    color: "Brown",
    material: "Wood",
    sku: "KC-009",
    isFeatured: false,
  },
  {
    name: "Glow in Dark Keychain",
    description:
      "Phosphorescent keychain that glows in the dark. Easy to find your keys at night.",
    price: 5.99,
    stock: 89,
    category: "Silicone",
    color: "Green",
    material: "Silicone",
    sku: "KC-010",
    isFeatured: false,
  },
  {
    name: "Car Keychain",
    description: "Realistic car design keychain. Perfect for car enthusiasts.",
    price: 8.99,
    stock: 52,
    category: "Metal",
    color: "Silver",
    material: "Zinc Alloy",
    sku: "KC-011",
    isFeatured: false,
  },
  {
    name: "House Keychain",
    description: "House-shaped keychain. A reminder of home wherever you go.",
    price: 7.99,
    stock: 63,
    category: "Acrylic",
    color: "White",
    material: "Acrylic",
    sku: "KC-012",
    isFeatured: false,
  },
  {
    name: "Dog Tag Keychain",
    description: "Military-style dog tag keychain. Customizable and durable.",
    price: 12.99,
    stock: 28,
    category: "Metal",
    color: "Silver",
    material: "Stainless Steel",
    sku: "KC-013",
    isFeatured: false,
  },
  {
    name: "Luggage Tag Keychain",
    description:
      "Leather luggage tag with keychain. Identify your bags in style.",
    price: 13.99,
    stock: 37,
    category: "Leather",
    color: "Brown",
    material: "Leather",
    sku: "KC-014",
    isFeatured: false,
  },
  {
    name: "Mickey Mouse Keychain",
    description: "Disney Mickey Mouse keychain. Official Disney merchandise.",
    price: 11.99,
    stock: 45,
    category: "Rubber",
    color: "Black",
    material: "Rubber",
    sku: "KC-015",
    isFeatured: false,
  },
  {
    name: "Superman Logo Keychain",
    description: "DC Comics Superman logo keychain. Up, up and away!",
    price: 9.99,
    stock: 31,
    category: "Metal",
    color: "Red",
    material: "Metal",
    sku: "KC-016",
    isFeatured: false,
  },
  {
    name: "Mini Screwdriver Keychain",
    description: "Multi-tool screwdriver keychain. 4 different bits included.",
    price: 16.99,
    stock: 19,
    category: "Metal",
    color: "Silver",
    material: "Stainless Steel",
    sku: "KC-017",
    isFeatured: false,
  },
  {
    name: "Whistle Keychain",
    description:
      "Emergency whistle keychain. Safety first with loud clear sound.",
    price: 4.99,
    stock: 94,
    category: "Plastic",
    color: "Orange",
    material: "Plastic",
    sku: "KC-018",
    isFeatured: false,
  },
  {
    name: "Memo Pad Keychain",
    description: "Mini notepad with pen keychain. Always ready to take notes.",
    price: 6.99,
    stock: 73,
    category: "Plastic",
    color: "Blue",
    material: "Plastic",
    sku: "KC-019",
    isFeatured: false,
  },
  {
    name: "Bottle Opener Keychain",
    description:
      "Heavy-duty bottle opener keychain. Different design from our classic.",
    price: 7.99,
    stock: 58,
    category: "Metal",
    color: "Black",
    material: "Stainless Steel",
    sku: "KC-020",
    isFeatured: false,
  },
];

const main = async () => {
  console.log("🌱 Starting database seeding...");
  console.log(`👑 Using admin ID: ${adminId}`);

  try {
    // Hash password for users
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Clear existing data in correct order
    console.log("\n🗑️ Clearing existing data...");

    await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.cartItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.cart.deleteMany(),
      prisma.product.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log("✅ Existing data cleared (keeping admin)");

    // Create users
    console.log("\n👥 Creating users...");
    const createdUsers = [];
    for (const userData of users) {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          isAdmin: userData.isAdmin,
        },
      });
      createdUsers.push(user);
      console.log(
        `✅ Created user: ${user.email} ${user.isAdmin ? "(Admin)" : ""}`,
      );
    }

    // Create products with images
    console.log("\n📦 Creating products...");
    const createdProducts = [];
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      const imageIndex = i % productImages.length; // Cycle through images

      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          images: [productImages[imageIndex]],
          category: productData.category,
          color: productData.color,
          material: productData.material,
          sku: productData.sku,
          isFeatured: productData.isFeatured,
          isActive: true,
        },
      });
      createdProducts.push(product);
      console.log(
        `✅ Created product ${i + 1}/${products.length}: ${product.name}`,
      );
    }

    // Create carts for each user
    console.log("\n🛒 Creating carts...");
    for (const user of createdUsers) {
      await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
    }
    console.log(`✅ Created ${createdUsers.length} carts`);

    // Create some cart items
    console.log("\n🛍️ Creating cart items...");
    let cartItemCount = 0;
    const usedCombinations = new Set();

    for (let i = 0; i < 30; i++) {
      const user =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
      });

      if (cart && createdProducts.length > 0) {
        const product =
          createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;

        const combinationKey = `${cart.id}-${product.id}`;

        if (!usedCombinations.has(combinationKey)) {
          usedCombinations.add(combinationKey);

          try {
            await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                productId: product.id,
                quantity: quantity,
              },
            });
            cartItemCount++;
          } catch (error) {
            // Skip if error
          }
        }
      }
    }
    console.log(`✅ Created ${cartItemCount} cart items`);

    // Create orders
    console.log("\n📋 Creating orders...");
    const statuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    let orderCount = 0;

    for (let i = 0; i < 50; i++) {
      const user =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 60));

      // Create 1-5 items for this order
      const numItems = Math.floor(Math.random() * 5) + 1;
      const orderItems = [];
      let total = 0;
      const usedProductIds = new Set();

      for (let j = 0; j < numItems; j++) {
        if (createdProducts.length > 0) {
          const product =
            createdProducts[Math.floor(Math.random() * createdProducts.length)];

          if (!usedProductIds.has(product.id)) {
            usedProductIds.add(product.id);
            const quantity = Math.floor(Math.random() * 3) + 1;

            orderItems.push({
              productId: product.id,
              quantity: quantity,
              price: product.price,
            });
            total += product.price * quantity;
          }
        }
      }

      if (orderItems.length > 0) {
        try {
          await prisma.order.create({
            data: {
              userId: user.id,
              total: total,
              status: status,
              address: user.address,
              phone: user.phone,
              notes:
                status === "cancelled"
                  ? "Customer requested cancellation"
                  : null,
              createdAt: orderDate,
              items: {
                create: orderItems,
              },
            },
          });
          orderCount++;
        } catch (error) {
          console.log(`⚠️ Error creating order: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${orderCount} orders`);

    // Print summary
    console.log("\n📊 ===== SEEDING COMPLETE =====");
    console.log(`👑 Admin ID: ${adminId}`);
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📦 Products: ${createdProducts.length}`);
    console.log(`🖼️  Images used: ${productImages.length}`);
    console.log(`🛒 Carts: ${createdUsers.length}`);
    console.log(`🛍️ Cart Items: ${cartItemCount}`);
    console.log(`📋 Orders: ${orderCount}`);

    console.log("\n🔑 ===== CREDENTIALS =====");
    console.log("Super Admin: superadmin@test.com / password123");
    console.log("Admin User (User model): user1@example.com / password123");
    console.log("Admin User (User model): user2@example.com / password123");
    console.log("Regular User: user3@example.com / password123");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
};

main()
  .catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("👋 Database connection closed");
  });
