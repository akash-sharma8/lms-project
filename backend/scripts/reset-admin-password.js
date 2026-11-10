import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/config/db.js';

const password = process.env.NEW_ADMIN_PASSWORD;
if (!password || password.length < 10) {
  console.error('Set NEW_ADMIN_PASSWORD (at least 10 characters) first');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);
const result = await prisma.user.updateMany({
  where: { email: 'admin@market.com' },
  data: { passwordHash },
});
console.log('Admin accounts updated:', result.count);
await prisma.$disconnect();