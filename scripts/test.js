#!/usr/bin/env node

const { testEndpoints, testAccessControlScenarios } = require('../src/utils/testEndpoints');

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'all':
        await testEndpoints();
        await testAccessControlScenarios();
        break;
      case 'endpoints':
        await testEndpoints();
        break;
      case 'access':
        await testAccessControlScenarios();
        break;
      default:
        console.log('Usage: node scripts/test.js [all|endpoints|access]');
        console.log('  all       - Run all tests');
        console.log('  endpoints - Test basic API endpoints');
        console.log('  access    - Test access control scenarios');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
