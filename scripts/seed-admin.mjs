// Creates or promotes an admin user.
// Usage: npm run seed:admin -- admin@yourtee.in MyPassword1
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "node:fs";

// Load .env.local (standalone scripts don't get Next's env loading)
try {
  const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* ignore */
}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/yourtee";
const email = (process.argv[2] || process.env.ADMIN_EMAIL || "admin@yourtee.in").toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || "Admin@1234";
const name = "YourTee Admin";

const userSchema = new mongoose.Schema(
  { name: String, email: { type: String, unique: true }, passwordHash: String, role: String },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

await mongoose.connect(uri);
const passwordHash = await bcrypt.hash(password, 12);
const doc = await User.findOneAndUpdate(
  { email },
  { $set: { role: "admin", name }, $setOnInsert: { email, passwordHash } },
  { upsert: true, new: true }
);

console.log(`✓ Admin ready: ${doc.email} (role=${doc.role})`);
console.log(`  Login → ${email} / ${password}  (password only applies to a newly created account)`);
await mongoose.disconnect();
process.exit(0);
