const { connectDB } = require('../config/db');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const InterviewSession = require('../models/InterviewSession');
const Response = require('../models/Response');
const Evaluation = require('../models/Evaluation');
const FinalReport = require('../models/FinalReport');
const initDatabase = require('./initDatabase');

/**
 * Completely purges all candidate data, temporary sessions, and responses,
 * and initializes the clean 6-round assessment platform for new candidate accounts.
 */
async function resetDatabase() {
  console.log('[Reset] Connecting to database...');
  await connectDB();

  console.log('[Reset] Removing candidate accounts and interview session data...');
  await Candidate.deleteMany({});
  await InterviewSession.deleteMany({});
  await Response.deleteMany({});
  await Evaluation.deleteMany({});
  await FinalReport.deleteMany({});
  await User.deleteMany({ role: 'candidate' });

  // Re-initialize clean admin and 6-round assessment template
  await initDatabase();

  console.log('[Reset] Database successfully sanitized with 6-Round assessment suite and zero mock candidates.');
}

if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('[Reset] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Reset Error]:', err);
      process.exit(1);
    });
}

module.exports = resetDatabase;
