import app from './app.js';
import { port } from './core/config/db.js';
import prisma from './core/lib/prisma.js';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database Connected');

    app.listen(port, () => {
      console.log(` Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(' Failed to connect to database');
    console.error(error);
    process.exit(1);
  }
};

startServer();