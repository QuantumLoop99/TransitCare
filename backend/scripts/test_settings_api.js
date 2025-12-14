import 'dotenv/config';
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testSettingsAPI() {
  console.log('🧪 Testing Settings API...\n');
  
  try {
    // Test 1: Get settings
    console.log('📖 Testing GET settings...');
    const getResponse = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (getResponse.ok) {
      const result = await getResponse.json();
      console.log('✅ Settings retrieved:', result.data);
    } else {
      console.log('❌ Failed to get settings:', getResponse.status);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Update AI prioritization setting
    console.log('💾 Testing PUT settings (disable AI)...');
    const updateResponse = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settings: {
          aiPrioritization: false
        },
        updatedBy: 'test-script'
      }),
    });
    
    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Settings updated:', result.data);
    } else {
      const error = await updateResponse.json();
      console.log('❌ Failed to update settings:', error);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Get settings again to verify
    console.log('🔍 Verifying settings update...');
    const verifyResponse = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (verifyResponse.ok) {
      const result = await verifyResponse.json();
      console.log('✅ Updated settings:', result.data);
      
      if (result.data.aiPrioritization === false) {
        console.log('🎉 AI prioritization successfully disabled!');
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 4: Re-enable AI prioritization
    console.log('🔄 Re-enabling AI prioritization...');
    const enableResponse = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settings: {
          aiPrioritization: true
        },
        updatedBy: 'test-script'
      }),
    });
    
    if (enableResponse.ok) {
      const result = await enableResponse.json();
      console.log('✅ AI prioritization re-enabled:', result.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSettingsAPI();