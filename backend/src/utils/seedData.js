/**
 * Clean Database Initializer
 * Replaces legacy mock data seeder. Ensures the database is cleanly initialized
 * with default administrator credentials and base interview templates, without
 * populating any mock or demo candidates.
 */
const initDatabase = require('./initDatabase');
const { connectDB } = require('../config/db');

async function seed() {
  console.log('[Seed] Initializing clean database for production...');
  await connectDB();
  await initDatabase();
  console.log('[Seed] Clean database initialized successfully. Ready for maintaining new user accounts.');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}

module.exports = seed;
