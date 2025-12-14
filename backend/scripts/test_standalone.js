import 'dotenv/config';
import { connectToDatabase } from '../src/config/db.js';
import { prioritizeComplaint } from '../src/utils/prioritizeComplaint.js';
import { setSetting, getSetting, initializeDefaultSettings } from '../src/models/Settings.js';

async function main() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDatabase(process.env.MONGODB_URI);
    
    console.log('🏗️ Initializing settings...');
    await initializeDefaultSettings();
    
    console.log('🧪 Testing AI Toggle...\n');
    
    // Test 1: Check current setting
    const currentSetting = await getSetting('aiPrioritization', true);
    console.log('Current AI setting:', currentSetting);
    
    // Test 2: Disable AI
    console.log('\n🔄 Disabling AI...');
    await setSetting('aiPrioritization', false, 'test');
    
    // Test 3: Test prioritization
    const testComplaint = {
      title: "Emergency: Bus Accident",
      description: "Bus crashed into a tree, passengers injured",
      category: "Safety"
    };
    
    const result = await prioritizeComplaint(testComplaint);
    console.log('\nPrioritization Result:');
    console.log('Priority:', result.priority);
    console.log('Reasoning:', result.reasoning);
    
    // Test 4: Re-enable AI
    console.log('\n🔄 Re-enabling AI...');
    await setSetting('aiPrioritization', true, 'test');
    
    const result2 = await prioritizeComplaint(testComplaint);
    console.log('\nPrioritization Result (AI enabled):');
    console.log('Priority:', result2.priority);
    console.log('Reasoning:', result2.reasoning);
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

main();