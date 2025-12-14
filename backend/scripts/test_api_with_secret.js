import 'dotenv/config';

async function testSettingsAPIWithSecret() {
  console.log('🧪 Testing Settings API with Admin Secret...\n');
  
  const BASE_URL = 'http://localhost:3001/api/admin';
  const ADMIN_SECRET = '8b3f1a6d9c2e4f0a7d8c5b6e3a1f2b4c6d7e8f90123456789abcdef01234567';
  
  try {
    // Test GET settings
    console.log('📖 Testing GET /admin/settings...');
    const getResponse = await fetch(`${BASE_URL}/settings`, {
      headers: {
        'x-admin-secret': ADMIN_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GET Status:', getResponse.status);
    
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ Current settings:', getResult.data);
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET Error:', errorText);
      return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test PUT settings - DISABLE AI
    console.log('💾 Testing PUT /admin/settings (DISABLE AI)...');
    const putResponse = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'x-admin-secret': ADMIN_SECRET,
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
      console.log('✅ AI Prioritization DISABLED:', putResult.data);
      
      // Verify the setting was saved
      console.log('\n🔍 Verifying setting was saved...');
      const verifyResponse = await fetch(`${BASE_URL}/settings`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET,
          'Content-Type': 'application/json'
        }
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log('Verified settings:', verifyResult.data);
        
        if (verifyResult.data.aiPrioritization === false) {
          console.log('✅ AI prioritization successfully disabled!');
        } else {
          console.log('❌ AI prioritization setting not saved correctly!');
        }
      }
      
    } else {
      const errorText = await putResponse.text();
      console.log('❌ PUT Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testSettingsAPIWithSecret();