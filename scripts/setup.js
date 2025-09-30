#!/usr/bin/env node

const { setupSampleData, cleanupSampleData } = require('../src/utils/setup');

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
      default:
        console.log('Usage: node scripts/setup.js [setup|cleanup]');
        console.log('  setup   - Create sample data for testing');
        console.log('  cleanup - Remove all sample data');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
