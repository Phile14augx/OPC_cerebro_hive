import { PrismaClient } from '@prisma/client';
import { AuthService } from '../lib/services/auth.service';
import { PlatformService } from '../lib/services/platform.service';
import { AuditService } from '../lib/services/audit.service';

const prisma = new PrismaClient();

async function run() {
  console.log('--- Phase 3: End-to-End Validation ---');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const password = 'SecurePassword123!';
  const fullName = 'End To End User';

  try {
    console.log(`[1] Registering user: ${testEmail}`);
    const token = await AuthService.register(testEmail, password, fullName);
    console.log('✅ JWT Token generated successfully');
    
    // Verify Models
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!user) throw new Error("User not found in DB");
    console.log(`✅ User created: ${user.id}`);
    
    const workspace = await prisma.workspace.findFirst({ where: { name: 'General Workspace' } });
    if (!workspace) throw new Error("Workspace not found in DB");
    console.log(`✅ Workspace provisioned: ${workspace.id}`);
    
    const project = await prisma.project.findFirst({ where: { workspaceId: workspace.id } });
    if (!project) throw new Error("Project not found in DB");
    console.log(`✅ Default project created: ${project.name}`);
    
    const auditEvent = await prisma.auditEvent.findFirst({ where: { userId: user.id } });
    if (!auditEvent) throw new Error("Audit event not found in DB");
    console.log(`✅ Audit event logged: ${auditEvent.action}`);

    console.log(`[2] Logging in user: ${testEmail}`);
    const loginToken = await AuthService.login(testEmail, password);
    console.log('✅ Login successful, JWT generated');
    
    console.log('--- E2E Validation Completed Successfully ---');
  } catch (error) {
    console.error('❌ E2E Validation Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
