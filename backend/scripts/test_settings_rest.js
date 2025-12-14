import 'dotenv/config';

async function testSettingsAPI() {
  console.log('🧪 Testing Settings API...\n');
  
  const BASE_URL = 'http://localhost:3001/api/admin';
  
  try {
    // Test GET settings without auth first
    console.log('📖 Testing GET /admin/settings...');
    const getResponse = await fetch(`${BASE_URL}/settings`);
    console.log('Status:', getResponse.status);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log('Error response:', errorText);
      console.log('\n🔧 The issue might be authentication. Let me check the requireAdmin middleware...');
      return;
    }
    
    const getResult = await getResponse.json();
    console.log('Current settings:', getResult.data);
    
    // Test PUT settings
    console.log('\n💾 Testing PUT /admin/settings...');
    const putResponse = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settings: {
          aiPrioritization: false
        },
        updatedBy: 'api-test'
      })
    });
    
    console.log('PUT Status:', putResponse.status);
    
    if (putResponse.ok) {
      const putResult = await putResponse.json();
      console.log('Update result:', putResult.data);
    } else {
      const errorText = await putResponse.text();
      console.log('PUT Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testSettingsAPI();