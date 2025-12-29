import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('Verifying User model definition...');

  const prisma = new PrismaClient();

  try {
    // Check if user delegate exists
    if (!prisma.user) {
      throw new Error('User model is not defined in Prisma Client!');
    }

    console.log('✅ Prisma Client has User model.');

    // Attempt a type check (static analysis in IDE, runtime check here)
    // We won't actually query the DB as it might be empty or require connection
    // But we can check if the delegate has standard methods
    if (typeof prisma.user.findMany !== 'function') {
      throw new Error('User model does not have findMany method!');
    }
    console.log('✅ User model has expected methods.');

    // Optional: Log model fields (if accessible via internal API, but usually not needed)
    console.log('User model verification successful!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
