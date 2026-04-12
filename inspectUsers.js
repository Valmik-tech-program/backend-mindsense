const mongoose = require('mongoose');
const User = require('./models/user');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const users = await User.find().limit(5).lean();
    console.log('users count:', users.length);
    users.forEach((u) => {
      console.log({
        email: u.email,
        name: u.name,
        testScores: u.testScores ? u.testScores.length : 0,
        diaryScores: u.diaryScores ? u.diaryScores.length : 0,
      });
    });
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
