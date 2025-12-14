import 'dotenv/config';
import { prioritizeComplaint } from '../src/utils/prioritizeComplaint.js';
import { setSetting, getSetting } from '../src/models/Settings.js';

const testComplaint = {
  title: "Bus Driver Driving Recklessly",
  description: "The driver was speeding, running red lights, and putting all passengers at risk. This is extremely dangerous and needs immediate attention.",
  category: "Safety",
  dateTime: new Date(),
  location: "Main Street",
  vehicleNumber: "BUS-123"
};

async function testAiToggleEffect() {
  console.log('🧪 Testing AI Toggle Effect on Complaint Prioritization...\n');
  
  try {
    // Step 1: Enable AI prioritization
    console.log('1️⃣ Enabling AI prioritization...');
    await setSetting('aiPrioritization', true, 'test-script');
    const enabledSetting = await getSetting('aiPrioritization');
    console.log('AI Setting after enable:', enabledSetting);
    
    console.log('\n📝 Testing complaint with AI ENABLED:');
    const aiResult = await prioritizeComplaint(testComplaint);
    console.log('Priority:', aiResult.priority);
    console.log('Reasoning:', aiResult.reasoning);
    console.log('Confidence:', aiResult.confidence);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Step 2: Disable AI prioritization
    console.log('2️⃣ Disabling AI prioritization...');
    await setSetting('aiPrioritization', false, 'test-script');
    const disabledSetting = await getSetting('aiPrioritization');
    console.log('AI Setting after disable:', disabledSetting);
    
    console.log('\n📝 Testing complaint with AI DISABLED:');
    const noAiResult = await prioritizeComplaint(testComplaint);
    console.log('Priority:', noAiResult.priority);
    console.log('Reasoning:', noAiResult.reasoning);
    console.log('Confidence:', noAiResult.confidence);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Summary
    if (aiResult.priority !== 'medium' && noAiResult.priority === 'medium') {
      console.log('✅ AI Toggle working correctly!');
      console.log('- With AI enabled: Priority was', aiResult.priority);
      console.log('- With AI disabled: Priority defaulted to', noAiResult.priority);
    } else {
      console.log('❌ AI Toggle NOT working correctly!');
      console.log('- With AI enabled: Priority was', aiResult.priority);
      console.log('- With AI disabled: Priority was', noAiResult.priority, '(should be medium)');
    }
    
    // Re-enable AI for normal operation
    await setSetting('aiPrioritization', true, 'test-script');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Ensure we exit cleanly
    setTimeout(() => process.exit(0), 1000);
  }
}

testAiToggleEffect();