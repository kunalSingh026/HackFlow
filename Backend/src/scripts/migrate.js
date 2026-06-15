const mongoose = require('mongoose');
const config = require('../config/config');
const Event = require('../models/event.model');

async function runMigration() {
  try {
    console.log('Connecting to database for migration...');
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to DB. Starting migration...');

    const count = await Event.countDocuments({ phases: { $exists: false } });
    if (count > 0) {
      console.log(`Migrating ${count} legacy events with new fields...`);
      await Event.updateMany(
        { phases: { $exists: false } },
        {
          $set: {
            phases: {
              registrationStart: new Date(),
              registrationEnd: new Date(),
              ideaSubmissionEnd: new Date(),
              shortlistAnnouncement: new Date(),
              hackingStart: new Date(),
              hackingEnd: new Date(),
              mentoringRounds: [],
              judgingValedictory: new Date(),
            },
            tracks: [],
            customProblemStatements: [],
            prizes: {
              totalPrizePool: 0,
              firstPlace: '',
              secondPlace: '',
              thirdPlace: '',
              specialCategories: [],
              swagPerks: {
                tshirts: false,
                meals: false,
                cloudCredits: false,
                certificates: false,
              },
            },
            judgingCriteria: [],
            eligibility: {
              institutionPolicy: 'open',
              interCollegeTeams: true,
              minTeamSize: 1,
              maxTeamSize: 4,
            },
            logistics: {
              discordInvite: '',
              whatsappInvite: '',
              faqs: [],
            },
          },
        }
      );
      console.log('Database migrated successfully!');
    } else {
      console.log('No legacy events found. Migration not needed.');
    }
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
  }
}

runMigration();
