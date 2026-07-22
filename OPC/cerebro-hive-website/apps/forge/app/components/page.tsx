'use client';
import { 
  PageContainer, PageHeader, 
  Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Input, Label, Checkbox,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@cerebro/ui';

export default function ComponentsPlayground() {
  return (
    <PageContainer className="pb-24">
      <PageHeader 
        title="Component Playground" 
        description="A living reference for the @cerebro/ui design system." 
      />
      
      <div className="mt-8 space-y-12">
        {/* Buttons */}
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Buttons</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button isLoading>Loading</Button>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Badges</h3>
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
          </div>
        </section>

        {/* Forms & Inputs */}
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Forms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="agent@cerebrohive.ai" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Create Project</CardTitle>
                <CardDescription>Deploy your new autonomous agent into a workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" placeholder="e.g. Sales Optimizer" />
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Deploy</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Overlays */}
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Overlays</h3>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your
                    agent and remove its memory from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button variant="destructive">Delete Agent</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tooltip content goes here.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </section>

        {/* Tables */}
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Tables</h3>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Invocations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Support Bot</TableCell>
                  <TableCell><Badge variant="success">Active</Badge></TableCell>
                  <TableCell>v2.4.1</TableCell>
                  <TableCell className="text-right">2,504</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sales Optimizer</TableCell>
                  <TableCell><Badge variant="warning">Training</Badge></TableCell>
                  <TableCell>v1.0.0-rc</TableCell>
                  <TableCell className="text-right">0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Data Pipeline</TableCell>
                  <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
                  <TableCell>v3.2.0</TableCell>
                  <TableCell className="text-right">12,042</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>
      </div>
    </PageContainer>
  );
}
