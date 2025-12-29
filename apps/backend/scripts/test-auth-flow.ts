import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAuthFlow() {
  const timestamp = Date.now();
  const phone = `138${timestamp.toString().slice(-8)}`;
  const password = 'password123';

  console.log(`Testing with Phone: ${phone}, Password: ${password}`);

  // 1. Register
  console.log('\n1. Testing Register...');
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, nickname: 'TestUser' }),
  });

  const registerData = await registerRes.json();
  if (!registerRes.ok) {
    console.error('Register failed:', registerData);
    process.exit(1);
  }
  console.log('Register success:', registerData.data.user.id);

  // 2. Login (Target Feature)
  console.log('\n2. Testing Login...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });

  if (loginRes.status === 404) {
    console.log('Login endpoint not found (Expected before implementation)');
  } else if (!loginRes.ok) {
    const loginData = await loginRes.json();
    console.error('Login failed:', loginData);
    process.exit(1);
  } else {
    const loginData = await loginRes.json();
    console.log('Login success!');

    // 3. Verify Token
    const token = loginData.data?.token;
    if (!token) {
      console.error('No token returned from login');
      process.exit(1);
    }

    console.log('\n3. Testing Get Me (with Login Token)...');
    const meRes = await fetch(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const meData = await meRes.json();
    if (!meRes.ok) {
      console.error('Get Me failed:', meData);
      process.exit(1);
    }
    console.log('Get Me success:', meData.data.id);

    if (meData.data.id === registerData.data.user.id) {
      console.log('\n✅ All Tests Passed: Auth Flow Verified');
    } else {
      console.error('\n❌ User ID mismatch');
      process.exit(1);
    }
  }
}

testAuthFlow().catch(console.error);
