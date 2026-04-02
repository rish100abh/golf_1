// backend/config/db.js - Serverless Prisma + Neon
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;