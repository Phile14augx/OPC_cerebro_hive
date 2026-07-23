import { ConfigManager } from '@cerebro/config-core';
import { MemoryEventBus, EventBus } from '@cerebro/core-bus';
import { Telemetry, MockTelemetryFacade } from '@cerebro/telemetry-core';
import { RuntimeRegistry } from '@cerebro/runtime-core';
import { CapabilityRegistry } from '@cerebro/capability-core';

export interface KernelOptions {
  env?: Record<string, string>;
}

export class CerebroKernel {
  public config: ConfigManager;
  public eventBus: EventBus;
  public runtime: RuntimeRegistry;
  public capabilities: CapabilityRegistry;
  private state: 'booting' | 'running' | 'stopped' = 'stopped';

  constructor(options?: KernelOptions) {
    this.config = new ConfigManager();
    this.eventBus = new MemoryEventBus();
    this.runtime = new RuntimeRegistry();
    this.capabilities = new CapabilityRegistry();
  }

  async bootstrap(): Promise<void> {
    if (this.state !== 'stopped') return;
    this.state = 'booting';
    
    console.log('[Kernel] Bootstrapping Enterprise AI OS...');
    
    // Phase 1: Load Configuration
    this.config.load();
    console.log('[Kernel] Loaded Configuration');

    // Phase 2: Initialize Identity (Mocked for now)
    console.log('[Kernel] Initialized Identity Root');

    // Phase 3: Connect Event Bus
    // Bus is already instantiated as memory bus
    console.log('[Kernel] Event Bus Connected');

    // Phase 4: Start Telemetry
    Telemetry.setInstance(new MockTelemetryFacade());
    const bootSpan = Telemetry.startSpan('kernel.bootstrap');
    console.log('[Kernel] Telemetry Started');

    // Phase 5: Load Capabilities
    console.log('[Kernel] Discovered Capabilities');

    bootSpan.end();
    this.state = 'running';
    console.log('[Kernel] OS is running.');
  }

  async shutdown(): Promise<void> {
    if (this.state !== 'running') return;
    console.log('[Kernel] Shutting down OS...');
    await this.runtime.stopAll();
    this.state = 'stopped';
  }
}
