import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  url: process.env.DATABASE_URL
});

async function main() {
  const count = await prisma.user.count();
  console.log(`User count: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
