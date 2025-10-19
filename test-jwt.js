// Test JWT authentication
async function testJWT() {
  console.log('Testing JWT authentication...\n');

  // Test 1: Signup
  console.log('1. Testing signup...');
  const signupResponse = await fetch('http://localhost:3001/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'TestPass123',
      name: 'Test User'
    })
  });

  const signupData = await signupResponse.json();
  console.log('Signup response:', signupData);

  if (!signupData.success) {
    console.error('Signup failed:', signupData.error);
    return;
  }

  const token = signupData.token;
  console.log('Got JWT token:', token.substring(0, 50) + '...');

  // Test 2: Verify session with JWT
  console.log('\n2. Testing session verification...');
  const sessionResponse = await fetch('http://localhost:3001/auth/session', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const sessionData = await sessionResponse.json();
  console.log('Session response:', sessionData);

  // Test 3: Test Canvas setup (will fail without real token, but should validate JWT)
  console.log('\n3. Testing Canvas setup with JWT...');
  const canvasResponse = await fetch('http://localhost:3001/auth/setup-canvas', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      canvasToken: 'fake-token-for-testing'
    })
  });

  const canvasData = await canvasResponse.json();
  console.log('Canvas setup response:', canvasData);

  console.log('\n✅ JWT authentication test completed!');
}

// Run the test
testJWT().catch(console.error);