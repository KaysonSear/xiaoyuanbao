import axios from 'axios';

async function testOrders() {
  try {
    // 1. Login to get token (User 1)
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '13800138000',
        password: '123456',
      }),
    });

    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
    const loginData = await loginRes.json();
    const token = loginData.data?.token;

    if (!token) throw new Error('No token returned');
    console.log('Login successful, token:', token.substring(0, 20) + '...');

    // 2. Get Orders
    const ordersRes = await fetch('http://localhost:3000/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!ordersRes.ok) throw new Error(`Get orders failed: ${ordersRes.statusText}`);
    const ordersData = await ordersRes.json();
    console.log('Orders count:', ordersData.data?.length);
    if (ordersData.data?.length > 0) {
      console.log('First Order:', ordersData.data[0]);
    } else {
      console.log('No orders found.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testOrders();
