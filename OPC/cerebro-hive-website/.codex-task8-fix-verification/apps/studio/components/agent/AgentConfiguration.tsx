'use client';

import React from 'react';
import { AgentConfiguration as AgentConfigType } from '@cerebro/sdk';

export function AgentConfiguration({ config }: { config: AgentConfigType }) {
  return (
    <div className="flex-1 overflow-auto p-6 bg-background">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Identity */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Identity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Display Name</label>
              <input type="text" className="w-full bg-muted/10 border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" defaultValue={config.metadata.name} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Version</label>
              <input type="text" className="w-full bg-muted/10 border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" defaultValue={config.metadata.version} readOnly />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Description</label>
              <textarea className="w-full bg-muted/10 border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary h-20" defaultValue={config.metadata.description} />
            </div>
          </div>
        </section>

        {/* Prompt Reference */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2 flex justify-between items-center">
            <span>Prompt Reference</span>
            <button className="text-xs text-primary hover:underline">Open in Prompt Studio</button>
          </h2>
          <div className="p-4 bg-muted/10 border border-border rounded flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">Template: {config.promptReference.templateId}</div>
              <div className="text-xs text-muted-foreground mt-1">Version: {config.promptReference.versionId || 'Latest Published'}</div>
            </div>
            <button className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded">Change Template</button>
          </div>
        </section>

        {/* Model */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Model Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Provider</label>
              <select className="w-full bg-muted/10 border border-border rounded px-3 py-2 text-sm outline-none" defaultValue={config.modelConfig.provider}>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Model</label>
              <select className="w-full bg-muted/10 border border-border rounded px-3 py-2 text-sm outline-none" defaultValue={config.modelConfig.model}>
                <option value="gpt-4o">gpt-4o</option>
                <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground flex justify-between mb-1">
                <span>Temperature</span>
                <span>{config.modelConfig.temperature}</span>
              </label>
              <input type="range" min="0" max="2" step="0.1" defaultValue={config.modelConfig.temperature} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Max Tokens</label>
              <input type="number" className="w-full bg-muted/10 border border-border rounded px-3 py-2 text-sm outline-none" defaultValue={config.modelConfig.maxTokens} />
            </div>
          </div>
        </section>

        {/* Memory Strategy */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Memory Strategy</h2>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked={config.memoryStrategy.useWorkingMemory} className="rounded accent-primary" />
              <span>Working Memory</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked={config.memoryStrategy.useConversationMemory} className="rounded accent-primary" />
              <span>Conversation Memory</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked={config.memoryStrategy.useSemanticMemory} className="rounded accent-primary" />
              <span>Semantic Memory</span>
            </label>
          </div>
        </section>

        {/* Tools */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2 flex justify-between items-center">
            <span>Tools</span>
            <button className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded">Add Tool</button>
          </h2>
          <div className="space-y-2">
            {config.tools.map(tool => (
              <div key={tool.toolId} className="p-3 bg-muted/10 border border-border rounded flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked={tool.enabled} className="rounded accent-primary" />
                  <span className="text-sm font-medium">{tool.toolId}</span>
                </div>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span>Timeout: {tool.timeoutMs}ms</span>
                  <span>Retry: {tool.retryPolicy}</span>
                  <button className="text-primary hover:underline">Configure</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Policies */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Execution Policies</h2>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Max Budget ($)</label>
            <input type="number" className="w-1/2 bg-muted/10 border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" defaultValue={config.policies.maxBudget || ''} placeholder="No limit" />
          </div>
        </section>

      </div>
    </div>
  );
}
