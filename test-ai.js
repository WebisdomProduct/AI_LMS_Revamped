// Quick AI Test Script
// Open browser console (F12) on http://localhost:8081/teacher/settings
// Copy and paste this entire script and press Enter

console.log('🧪 Starting AI Feature Test...\n');

// Import the AI functions
import { getEducationalTrends, getSchoolPoliciesInfo, expandIdeaAssistant, askCustomQuestion } from './src/services/ai';

async function testAllAI() {
    console.log('1️⃣ Testing Educational Trends...');
    try {
        const trends = await getEducationalTrends();
        console.log('✅ Trends Response:', trends.substring(0, 200) + '...');
    } catch (error) {
        console.error('❌ Trends Failed:', error);
    }

    console.log('\n2️⃣ Testing School Policies...');
    try {
        const policies = await getSchoolPoliciesInfo();
        console.log('✅ Policies Response:', policies.substring(0, 200) + '...');
    } catch (error) {
        console.error('❌ Policies Failed:', error);
    }

    console.log('\n3️⃣ Testing Idea Expansion...');
    try {
        const expansion = await expandIdeaAssistant('Using VR for teaching solar system');
        console.log('✅ Expansion Response:', expansion.substring(0, 200) + '...');
    } catch (error) {
        console.error('❌ Expansion Failed:', error);
    }

    console.log('\n4️⃣ Testing Custom Question...');
    try {
        const answer = await askCustomQuestion('How to teach fractions to grade 5?');
        console.log('✅ Custom Query Response:', answer.substring(0, 200) + '...');
    } catch (error) {
        console.error('❌ Custom Query Failed:', error);
    }

    console.log('\n✨ Test Complete!');
}

testAllAI();
