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
    directory: 'server',
    command: 'npm',
    args: ['test', '--', '--testPathPattern=complete-flow.test.js'],
    description: 'Testing complete user flow: registration, login, ride requests, driver acceptance'
  },
  {
    name: 'Web Interface Tests',
    directory: 'web',
    command: 'npm',
    args: ['test'],
    description: 'Testing web interface interactions and user experience'
  }
];

// Function to run a single test suite
function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running ${test.name}...`);
    console.log(`📝 ${test.description}\n`);

    const testProcess = spawn(test.command, test.args, {
      cwd: path.join(__dirname, test.directory),
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
  console.log('📊 TEST RESULTS SUMMARY');
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
    console.log('\n📱 Test Coverage:');
    console.log('   ✅ Driver registration and login');
    console.log('   ✅ Passenger registration and login');
    console.log('   ✅ Ride request functionality');
    console.log('   ✅ Driver ride acceptance');
    console.log('   ✅ Web interface interactions');
    console.log('   ✅ Error handling and validation');
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
