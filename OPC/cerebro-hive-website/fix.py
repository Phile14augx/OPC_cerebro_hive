import re
with open('packages/db/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    c = f.read()
def add(m, f):
    global c
    c = re.sub(r'(model\s+' + m + r'\s+\{.*?)(^\})', r'\1' + '\n' + f + r'\n\2', c, flags=re.MULTILINE | re.DOTALL)
add('User', '  orgMemberships OrgMembership[]\n  invitations    Invitation[]    @relation(\"InvitedBy\")')
add('Organization', '  members        OrgMembership[]\n  invitations    Invitation[]\n  aiUsage        AIUsageRecord[]\n  subscriptions  Subscription[]\n  invoices       Invoice[]\n  usageBudgets   UsageBudget[]\n  prompts        Prompt[]')
add('PromptVersion', '  prompt         Prompt          @relation(fields: [promptId], references: [id], onDelete: Cascade)')
add('EvalRun', '  prompt         Prompt?         @relation(fields: [promptId], references: [id], onDelete: SetNull)')
with open('packages/db/prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(c)
