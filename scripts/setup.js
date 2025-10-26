#!/usr/bin/env node

const { setupSampleData, cleanupSampleData, ensureTablesExist } = require('../src/utils/setup');

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'setup':
        await setupSampleData();
        break;
      case 'cleanup':
        await cleanupSampleData();
        break;
      case 'tables':
        await ensureTablesExist();
        break;
      default:
        console.log('Usage: node scripts/setup.js [setup|cleanup|tables]');
        console.log('  setup   - Create sample data for testing (includes table creation)');
        console.log('  cleanup - Remove all sample data');
        console.log('  tables  - Create DynamoDB tables only');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
