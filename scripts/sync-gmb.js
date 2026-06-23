#!/usr/bin/env node
/**
 * GMB Sync Script
 * Run this to sync Google My Business data to your directory
 * 
 * Usage: node scripts/sync-gmb.js
 */

const { GMBIntegration } = require('../lib/gmb-integration');

async function main() {
  console.log('🔄 Starting GMB Sync...\n');

  try {
    const gmb = new GMBIntegration();
    
    // Check environment variables
    if (!process.env.GMB_CLIENT_EMAIL || !process.env.GMB_PRIVATE_KEY) {
      console.error('❌ Missing GMB credentials. Please set:');
      console.error('   - GMB_CLIENT_EMAIL');
      console.error('   - GMB_PRIVATE_KEY');
      console.error('   - GMB_ACCOUNT_NAME');
      process.exit(1);
    }

    // Sync all locations
    console.log('📥 Fetching GMB locations...');
    const result = await gmb.syncAllLocations();
    
    console.log('\n✅ Sync Complete!');
    console.log(`   Success: ${result.success}`);
    console.log(`   Failed: ${result.failed}`);

    // Sync reviews for each location
    console.log('\n📝 Syncing reviews...');
    const locations = await gmb.fetchAllLocations();
    
    for (const location of locations) {
      try {
        // Find dispensary by GMB ID
        const { prisma } = require('../lib/db');
        const dispensary = await prisma.dispensary.findFirst({
          where: { gmbLocationId: location.name }
        });

        if (dispensary) {
          await gmb.syncReviews(dispensary.id, location.name);
        }
      } catch (error) {
        console.error(`   Error syncing reviews for ${location.name}:`, error.message);
      }
    }

    console.log('\n🎉 All done!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();
