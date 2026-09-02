async function testApi() {
  try {
    // 1. Login as police
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'officer@protego.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    console.log('Police token:', token.substring(0, 20) + '...');

    // 2. Fetch crimes
    const crimesRes = await fetch('http://localhost:5000/api/v1/crimes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const crimesData = await crimesRes.json();
    console.log('Crimes returned:', crimesData.data?.reports?.length);

    // 3. Fetch GDs
    const gdRes = await fetch('http://localhost:5000/api/v1/gd', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const gdData = await gdRes.json();
    console.log('GDs returned:', gdData.data?.gds?.length);

  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

testApi();
