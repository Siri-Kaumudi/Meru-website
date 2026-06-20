require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createAdmin() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meru-darji-census';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'Meru@Admin2024';

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`Admin '${username}' already exists.`);
    await mongoose.disconnect();
    return;
  }

  const admin = new Admin({ username, password });
  await admin.save();
  console.log(`✅  Admin created — username: ${username}`);
  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
