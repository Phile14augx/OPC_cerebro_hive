'use client';
import { useUser, usePermissions } from '@cerebro/auth';
import { PageContainer, PageHeader, EmptyState } from '@cerebro/ui';

export default function Home() {
  const user = useUser();
  const { can } = usePermissions();

  if (!user) return <PageContainer><PageHeader title="Loading..." /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader 
        title={`Welcome, ${user.name}`} 
        description="HiveForge Agent Innovation Factory" 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="p-6 bg-background rounded-lg border border-border shadow-sm">
          <h3 className="font-semibold text-lg">Your Roles</h3>
          <ul className="mt-2 text-muted-foreground text-sm list-disc list-inside">
            {user.roles.map(role => <li key={role}>{role}</li>)}
          </ul>
        </div>
        <div className="p-6 bg-background rounded-lg border border-border shadow-sm">
          <h3 className="font-semibold text-lg">Permissions Demo</h3>
          <div className="mt-4 space-y-2 text-sm">
            <p>Can deploy agents? 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${can('forge.deploy') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{can('forge.deploy') ? 'YES' : 'NO'}</span>
            </p>
            <p>Can execute flows? 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${can('flow.execute') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{can('flow.execute') ? 'YES' : 'NO'}</span>
            </p>
            <p>Can administer ops? 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${can('ops.admin') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{can('ops.admin') ? 'YES' : 'NO'}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <EmptyState 
          title="No Agents Found" 
          description="You haven't built any autonomous agents yet. Get started by creating your first specialized intelligence agent." 
          action={<button className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors">Create Agent</button>}
        />
      </div>
    </PageContainer>
  );
}
