
// Interface
export interface DashboardMetrics {
  activeModels: number;
  ingestionRate: number;
  errorRate: number;
}

export interface IDashboardProvider {
  getMetrics(): Promise<DashboardMetrics>;
}

// Mock Provider Implementation
export class MockDashboardProvider implements IDashboardProvider {
  async getMetrics() {
    await new Promise(r => setTimeout(r, 800)); // simulate latency
    return {
      activeModels: 42,
      ingestionRate: 15400, // rows/sec
      errorRate: 0.012
    };
  }
}

// Repository
export class DashboardRepository {
  constructor(private provider: IDashboardProvider) {}

  getMetrics() {
    return this.provider.getMetrics();
  }
}

// Singleton export (Injected with Mock Provider for M3 phase 1)
export const dashboardRepository = new DashboardRepository(new MockDashboardProvider());
