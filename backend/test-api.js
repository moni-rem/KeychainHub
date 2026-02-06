const axios = require('axios');
require('dotenv').config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
let authToken = null;
let testUserId = null;
let testProductId = null;

console.log('🚀 Starting API Tests...');
console.log('='.repeat(60));

const axiosInstance = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
});

// Helper function for tests
async function test(name, testFn) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    await testFn();
    console.log(`✅ ${name} - PASSED`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} - FAILED`);
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

async function runAllTests() {
  let passed = 0;
  let failed = 0;

  // 1. Health Check
  const healthResult = await test('Health Check', async () => {
    const response = await axiosInstance.get('/health');
    if (response.status !== 200) throw new Error('Status not 200');
    if (!response.data.success) throw new Error('Response not successful');
    console.log(`   Server: ${response.data.message}`);
  });
  healthResult ? passed++ : failed++;

  // 2. Get Products (Public)
  const productsResult = await test('Get Products (Public)', async () => {
    const response = await axiosInstance.get('/products');
    if (response.status !== 200) throw new Error('Failed to get products');
    if (!response.data.data) throw new Error('No data in response');
    console.log(`   Found ${response.data.data.products?.length || 0} products`);
    
    // Save first product ID for later tests
    if (response.data.data.products?.[0]) {
      testProductId = response.data.data.products[0].id;
    }
  });
  productsResult ? passed++ : failed++;

  // 3. Get Featured Products
  const featuredResult = await test('Get Featured Products', async () => {
    const response = await axiosInstance.get('/products/featured');
    if (response.status !== 200) throw new Error('Failed to get featured products');
    console.log(`   Found ${response.data.data.products?.length || 0} featured products`);
  });
  featuredResult ? passed++ : failed++;

  // 4. Register New User
  const registerResult = await test('Register New User', async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const response = await axiosInstance.post('/auth/register', {
      email: testEmail,
      password: 'Test123!',
      name: 'API Test User'
    });
    
    if (response.status !== 201) throw new Error('Registration failed');
    if (!response.data.data.token) throw new Error('No token received');
    
    authToken = response.data.data.token;
    testUserId = response.data.data.user.id;
    
    // Set token for subsequent requests
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    console.log(`   Registered: ${testEmail}`);
    console.log(`   Token received: ${authToken.substring(0, 20)}...`);
  });
  registerResult ? passed++ : failed++;

  // 5. Get User Profile
  const profileResult = await test('Get User Profile', async () => {
    if (!authToken) throw new Error('No auth token available');
    
    const response = await axiosInstance.get('/auth/profile');
    if (response.status !== 200) throw new Error('Failed to get profile');
    console.log(`   User: ${response.data.data.user.email}`);
    console.log(`   Name: ${response.data.data.user.name}`);
  });
  profileResult ? passed++ : failed++;

  // 6. Add to Cart
  const cartResult = await test('Add Item to Cart', async () => {
    if (!testProductId) throw new Error('No product ID available');
    
    const response = await axiosInstance.post('/cart', {
      productId: testProductId,
      quantity: 2
    });
    
    if (response.status !== 200) throw new Error('Failed to add to cart');
    console.log(`   Added ${response.data.data.cart.items.length} items to cart`);
    console.log(`   Subtotal: $${response.data.data.subtotal}`);
  });
  cartResult ? passed++ : failed++;

  // 7. Get Cart
  const getCartResult = await test('Get Cart', async () => {
    const response = await axiosInstance.get('/cart');
    if (response.status !== 200) throw new Error('Failed to get cart');
    console.log(`   Cart has ${response.data.data.cart.items.length} items`);
    console.log(`   Total items: ${response.data.data.itemCount}`);
  });
  getCartResult ? passed++ : failed++;

  // 8. Get Single Product
  const singleProductResult = await test('Get Single Product', async () => {
    if (!testProductId) throw new Error('No product ID available');
    
    const response = await axiosInstance.get(`/products/${testProductId}`);
    if (response.status !== 200) throw new Error('Failed to get product');
    console.log(`   Product: ${response.data.data.product.name}`);
    console.log(`   Price: $${response.data.data.product.price}`);
  });
  singleProductResult ? passed++ : failed++;

  // 9. Login with Admin
  const adminLoginResult = await test('Admin Login', async () => {
    const response = await axiosInstance.post('/auth/login', {
      email: 'admin@keychain.com',
      password: 'admin123'
    });
    
    if (response.status !== 200) throw new Error('Admin login failed');
    console.log(`   Admin login successful`);
    
    // Save admin token separately
    const adminToken = response.data.data.token;
    console.log(`   Admin token: ${adminToken.substring(0, 20)}...`);
  });
  adminLoginResult ? passed++ : failed++;

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL API TESTS PASSED! Your backend is working perfectly!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/api/health`);
    return true;
  } catch (error) {
    console.log('\n⚠️ Server is not running!');
    console.log('Start the server first with: npm run dev');
    console.log('Then run: node test-api.js');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
}

main();
