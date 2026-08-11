'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Activity, Play, Pause, Square, Search, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/platform/StatusBadge';
import { MetricTile } from '@/components/platform/MetricTile';

// Mock execution data
const mockExecutions = [
  { id: 'exec-101', name: 'Compliance Audit - Q3', type: 'Workflow', status: 'Running', startTime: '2m ago', cost: '$0.42' },
  { id: 'exec-102', name: 'Invoice Processing', type: 'Agent', status: 'NeedsApproval', startTime: '15m ago', cost: '$1.15' },
  { id: 'exec-103', name: 'Knowledge Sync', type: 'Workflow', status: 'Completed', startTime: '1h ago', cost: '$0.08' },
  { id: 'exec-104', name: 'Risk Assessment', type: 'Agent', status: 'Failed', startTime: '2h ago', cost: '$0.12' },
];

export default function RuntimeDashboard() {
  const [activeTab, setActiveTab] = useState('live');
  const [search, setSearch] = useState('');

  // Simulating live updates
  const [executions, setExecutions] = useState(mockExecutions);

  useEffect(() => {
    // In a real implementation, this would be an SSE connection to /api/v1/runtime/events/stream
    const interval = setInterval(() => {
      setExecutions(prev => {
        const newExecs = [...prev];
        const runningIdx = newExecs.findIndex(e => e.status === 'Running');
        if (runningIdx !== -1) {
          // just toggling cost for visual effect of streaming
          newExecs[runningIdx] = { ...newExecs[runningIdx], cost: `$${(Math.random() * 2).toFixed(2)}` };
        }
        return newExecs;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Execution Runtime</h1>
          <p className="text-muted-foreground mt-1">
            Enterprise AI Operating System Kernel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            System Health
          </Button>
          <Button size="sm">
            <Play className="mr-2 h-4 w-4" />
            New Execution
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Active Executions" value="12" sub="Across 4 workspaces" icon={<Activity />} trend={{ value: "15%", positive: true }} />
        <MetricTile label="Pending Approvals" value="3" sub="Requires operator action" icon={<Pause />} trend={{ value: "2%", positive: false }} />
        <MetricTile label="Throughput" value="142 / min" sub="Events processed" icon={<Activity />} trend={{ value: "5%", positive: true }} />
        <MetricTile label="Token Burn" value="1.2M" sub="Last 24 hours" icon={<Activity />} trend={{ value: "10%", positive: false }} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Executions</TabsTrigger>
          <TabsTrigger value="inspector">Execution Inspector</TabsTrigger>
          <TabsTrigger value="approvals">Approvals (3)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Execution Queue</CardTitle>
                <CardDescription>Real-time view of all runtime processes</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search execution ID..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Execution ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Cost Est.</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {executions.map((exec) => (
                      <motion.tr
                        key={exec.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="group"
                      >
                        <TableCell className="font-mono text-xs">{exec.id}</TableCell>
                        <TableCell className="font-medium">{exec.name}</TableCell>
                        <TableCell>{exec.type}</TableCell>
                        <TableCell>
                          <StatusBadge status={exec.status} />
                        </TableCell>
                        <TableCell>{exec.startTime}</TableCell>
                        <TableCell className="tabular-nums font-mono">{exec.cost}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {exec.status === 'Running' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500">
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {['Running', 'Queued', 'NeedsApproval'].includes(exec.status) && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inspector">
          <Card>
            <CardHeader>
              <CardTitle>Execution Inspector</CardTitle>
              <CardDescription>Select an execution from the live view to debug.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center border-dashed border-2 rounded-md m-4">
              <div className="text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No execution selected</p>
                <p className="text-xs">Click the eye icon on any execution to inspect its graph</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Executions paused in NeedsApproval state (Human-in-the-loop)</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Approval queue UI */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
