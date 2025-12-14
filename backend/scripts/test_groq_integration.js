import 'dotenv/config';
import { prioritizeComplaint } from '../src/utils/prioritizeComplaint.js';



// Test complaint data
const testComplaint = {
  title: "Broken Air Conditioning on Bus Route 45",
  description: "The air conditioning system on bus route 45 has been broken for the past week. Passengers are suffering in the heat, especially elderly passengers and children. This is making the commute unbearable during peak summer hours.",
  category: "Vehicle Maintenance",
  dateTime: new Date(),
  location: "Downtown Terminal",
  vehicleNumber: "BUS-045-12"
};

async function testGroqIntegration() {
  console.log('🧪 Testing Groq API integration for complaint prioritization...\n');
  
  console.log('Test Complaint:');
  console.log('Title:', testComplaint.title);
  console.log('Category:', testComplaint.category);
  console.log('Description:', testComplaint.description.substring(0, 100) + '...\n');
  
  try {
    console.log('⏳ Analyzing complaint with Groq API...');
    const startTime = Date.now();
    
    const analysis = await prioritizeComplaint(testComplaint);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ Analysis completed successfully!\n');
    console.log('📊 Results:');
    console.log('Priority:', analysis.priority);
    console.log('Sentiment:', analysis.sentiment);
    console.log('Confidence:', analysis.confidence);
    console.log('Reasoning:', analysis.reasoning);
    
    if (analysis.suggestedCategory) {
      console.log('Suggested Category:', analysis.suggestedCategory);
    }
    
    console.log('\n⚡ Performance:');
    console.log('Response Time:', responseTime + 'ms');
    
    console.log('\n🎉 Groq integration test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Please check your GROQ_API_KEY in the .env file');
  }
}

// Run the test
testGroqIntegration();