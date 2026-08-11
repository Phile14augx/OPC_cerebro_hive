import { prisma } from '../../index';
import { PrismaAgentRegistryBackfillStore, runBackfill } from './backfill';

async function main() {
  const mode = process.argv.includes('--apply') ? 'apply' : 'dry-run';
  const batchArg = process.argv.find(value => value.startsWith('--batch-size='));
  const batchSize = batchArg ? Number(batchArg.split('=')[1]) : 100;
  const manifest = await runBackfill(new PrismaAgentRegistryBackfillStore(prisma), { mode, batchSize });
  console.log(JSON.stringify(manifest, null, 2));
  await prisma.$disconnect();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
