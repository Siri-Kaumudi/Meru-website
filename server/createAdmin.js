require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('❌  ADMIN_PASSWORD not set in .env');
    process.exit(1);
  }

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`⚠️  Admin "${username}" already exists — no changes made.`);
    await mongoose.disconnect();
    return;
  }

  await Admin.create({ username, password });
  console.log(`✅  Admin account created — username: ${username}`);
  await mongoose.disconnect();
}

createAdmin().catch((err) => { console.error(err); process.exit(1); });
