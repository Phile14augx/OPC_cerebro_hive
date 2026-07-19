import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const healthCheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: 'UNKNOWN',
      redis: 'UNKNOWN' // Mocked for now until BullMQ/Redis is fully wired
    }
  };

  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.services.database = 'UP';
  } catch (e) {
    healthCheck.services.database = 'DOWN';
    healthCheck.status = 'DEGRADED';
  }

  // Set HTTP status code based on overall health
  const httpStatus = healthCheck.status === 'OK' ? 200 : 503;

  return NextResponse.json(healthCheck, { status: httpStatus });
}
