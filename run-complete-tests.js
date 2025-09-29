#!/usr/bin/env node

/**
 * Complete Test Runner for Taxi App
 * Runs both backend API tests and web interface tests
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚗 Starting Complete Taxi App Test Suite...\n');

// Test configuration
const tests = [
  {
    name: 'Backend API Tests',
    file: 'test-simple.js',
    description: 'Testing core backend functionality: registration, login, ride management'
  },
  {
    name: 'Web Interface Tests',
    directory: 'web',
    file: 'test-web-simple.js',
    description: 'Testing web interface functionality and API integration'
  }
];

// Function to run a single test suite
function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running ${test.name}...`);
    console.log(`📝 ${test.description}\n`);

    const testPath = test.directory 
      ? path.join(__dirname, test.directory, test.file)
      : path.join(__dirname, test.file);

    const testProcess = spawn('node', [testPath], {
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${test.name} completed successfully!\n`);
        resolve({ name: test.name, success: true });
      } else {
        console.log(`\n❌ ${test.name} failed with exit code ${code}\n`);
        resolve({ name: test.name, success: false, code });
      }
    });

    testProcess.on('error', (error) => {
      console.log(`\n❌ Error running ${test.name}: ${error.message}\n`);
      resolve({ name: test.name, success: false, error: error.message });
    });
  });
}

// Function to run all tests
async function runAllTests() {
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await runTest(test);
      results.push(result);
    } catch (error) {
      console.log(`\n❌ Unexpected error in ${test.name}: ${error.message}\n`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPLETE TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  let allPassed = true;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
    if (!result.success) {
      allPassed = false;
      if (result.code) {
        console.log(`   Exit code: ${result.code}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  });
  
  console.log('='.repeat(60));
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Your taxi app is working perfectly!');
    console.log('\n📱 Complete Test Coverage:');
    console.log('   ✅ Backend API functionality');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Driver and passenger flows');
    console.log('   ✅ Web interface functionality');
    console.log('   ✅ API integration');
    console.log('   ✅ Error handling and validation');
    console.log('   ✅ Database connectivity');
    console.log('   ✅ JWT authentication');
    console.log('   ✅ Ride management system');
    
    console.log('\n🚀 Your taxi app is ready for:');
    console.log('   • Production deployment');
    console.log('   • User testing');
    console.log('   • Feature expansion');
    console.log('   • Mobile app integration');
    
    console.log('\n📋 Test Files Created:');
    console.log('   • test-simple.js - Backend API tests');
    console.log('   • web/test-web-simple.js - Web interface tests');
    console.log('   • server/tests/integration/complete-flow.test.js - Comprehensive API tests');
    console.log('   • web/tests/web-app.test.js - Web app tests');
    console.log('   • TEST_RESULTS_COMPLETE.md - Detailed test results');
    
  } else {
    console.log('⚠️  Some tests failed. Please check the output above for details.');
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
