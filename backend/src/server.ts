import app from './app';
import { env } from './config/env';
import prisma from './config/database';

async function start() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ PostgreSQL connected');

    const server = app.listen(env.BACKEND_PORT, () => {
      console.log(`✅ Backend server running on http://localhost:${env.BACKEND_PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Intelligence: ${env.INTELLIGENCE_URL}`);
      console.log(`   API base: http://localhost:${env.BACKEND_PORT}/api/v1`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
