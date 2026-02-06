const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    // Clear existing data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ Cleared existing data');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@keychain.com',
        password: adminPassword,
        name: 'Admin User',
        isAdmin: true,
        phone: '+1234567890',
        address: '123 Admin Street'
      }
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
          address: `${i} User Street`
        }
      });
      users.push(user);
      console.log(`✅ User created: ${user.email}`);
    }
    
    // Create carts for all users
    const allUsers = [admin, ...users];
    for (const user of allUsers) {
      await prisma.cart.create({
        data: { userId: user.id }
      });
    }
    console.log('✅ Carts created for all users');
    
    // Create product categories
    const categories = ['Anime', 'Games', 'Movies', 'Custom', 'Animals'];
    
    // Create sample products
    const products = [
      {
        name: 'Naruto Keychain',
        description: 'High-quality Naruto Uzumaki keychain',
        price: 12.99,
        stock: 100,
        category: 'Anime',
        isFeatured: true,
        images: ['/uploads/products/naruto.jpg']
      },
      {
        name: 'Minecraft Creeper Keychain',
        description: 'Glow in the dark Creeper keychain',
        price: 9.99,
        stock: 75,
        category: 'Games',
        isFeatured: true,
        images: ['/uploads/products/minecraft.jpg']
      },
      {
        name: 'Star Wars Lightsaber',
        description: 'LED lightsaber keychain',
        price: 14.99,
        stock: 50,
        category: 'Movies',
        isFeatured: false,
        images: ['/uploads/products/starwars.jpg']
      },
      {
        name: 'Custom Name Keychain',
        description: 'Personalized keychain with your name',
        price: 8.99,
        stock: 200,
        category: 'Custom',
        isFeatured: true,
        images: ['/uploads/products/custom.jpg']
      },
      {
        name: 'Cat Keychain',
        description: 'Adorable cat keychain with moving parts',
        price: 7.99,
        stock: 150,
        category: 'Animals',
        isFeatured: false,
        images: ['/uploads/products/cat.jpg']
      }
    ];
    
    // Insert all products
    for (const productData of products) {
      await prisma.product.create({
        data: productData
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
            status: i === 0 ? 'delivered' : 'pending',
            address: user.address,
            phone: user.phone,
            notes: i === 0 ? 'Left at front door' : null,
            items: {
              create: [
                {
                  productId: allProducts[0].id,
                  quantity: 2,
                  price: allProducts[0].price
                },
                {
                  productId: allProducts[1].id,
                  quantity: 1,
                  price: allProducts[1].price
                }
              ]
            }
          }
        });
        console.log(`✅ Order created for ${user.email}: ${order.id.slice(0, 8)}`);
      }
    }
    
    console.log('🎉 Database seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
