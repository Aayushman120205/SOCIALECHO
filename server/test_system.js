const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/user.model');
const Community = require('./models/community.model');
const Config = require('./models/config.model');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check moderators
    const moderators = await User.find({ role: "moderator" }).select("_id name email role");
    console.log(`📊 Moderators in Database: ${moderators.length}`);
    if (moderators.length > 0) {
      moderators.forEach(mod => console.log(`  - ${mod.name} (${mod.email})`));
    } else {
      console.log('  ❌ No moderators found - Create user with @mod.socialecho.com email');
    }

    // Check communities with moderators
    const communities = await Community.find({ moderators: { $exists: true, $ne: [] } })
      .select("name moderators members")
      .populate("moderators", "name email");
    console.log(`\n📍 Communities with Moderators: ${communities.length}`);
    communities.forEach(comm => {
      console.log(`  Community: ${comm.name}`);
      console.log(`    Moderators: ${comm.moderators.map(m => m.name).join(', ')}`);
      console.log(`    Members: ${comm.members.length}`);
    });

    // Check system config
    const config = await Config.findOne();
    console.log(`\n⚙️  System Configuration:`);
    if (config) {
      console.log(`  Service Provider: ${config.categoryFilteringServiceProvider}`);
      console.log(`  Perspective API: ${config.usePerspectiveAPI ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`  Timeout: ${config.categoryFilteringRequestTimeout}ms`);
    } else {
      console.log('  ❌ No config found - using defaults');
    }

    // Check environment variables
    console.log(`\n🔑 API Configuration Status:`);
    console.log(`  Perspective API Key: ${process.env.PERSPECTIVE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  TextRazor API Key: ${process.env.TEXTRAZOR_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  Classifier API URL: ${process.env.CLASSIFIER_API_URL ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  Email Service: ${process.env.EMAIL_SERVICE || '❌ Missing'}`);

    console.log(`\n🎯 Summary:`);
    console.log(`  Moderators: ${moderators.length ? '✅ READY' : '⚠️  NEED TO CREATE'}`);
    console.log(`  Communities: ${communities.length}`);
    console.log(`  Config: ${config ? '✅ Set' : '❌ Not Set'}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
