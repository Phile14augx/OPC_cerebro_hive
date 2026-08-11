import { Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@cerebro/db';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: async () => {
        // Prisma 7's generated client uses the WASM query compiler, which
        // requires a driver adapter -- see https://pris.ly/d/driver-adapters.
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
        const prisma = new PrismaClient({
          adapter,
          log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
        });
        await prisma.$connect();
        return prisma;
      },
    },
  ],
  exports: [PrismaClient],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
