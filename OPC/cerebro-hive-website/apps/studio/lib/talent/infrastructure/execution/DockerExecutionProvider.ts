export interface ExecutionConfig {
  cpuQuota: number;       // e.g. 0.5 (half a core)
  memoryLimitMb: number;  // e.g. 256
  executionTimeoutMs: number; // e.g. 10000
  networkEnabled: boolean;
  readOnlyFilesystem: boolean;
}

export interface IExecutionProvider {
  /**
   * 1. Provision: Create the isolated sandbox environment.
   */
  provision(envId: string, config: ExecutionConfig): Promise<void>;

  /**
   * 2. Start & 3. Execute: Mount artifacts and run the primary script.
   */
  execute(envId: string, command: string[], artifacts: Record<string, string>): Promise<void>;

  /**
   * 4. Stream: Listen to real-time stdout/stderr during execution.
   */
  streamLogs(envId: string, onChunk: (chunk: string) => void): void;

  /**
   * 5. Collect: Gather final results and exit codes.
   */
  collectResult(envId: string): Promise<{ exitCode: number, durationMs: number, artifacts: string[] }>;

  /**
   * 6. Cleanup: Destroy the sandbox and release host resources.
   */
  cleanup(envId: string): Promise<void>;
}

/**
 * Docker-based Execution Provider.
 * Note: This code runs on the WORKER NODE, absolutely isolated from Next.js APIs.
 */
export class DockerExecutionProvider implements IExecutionProvider {
  async provision(envId: string, config: ExecutionConfig): Promise<void> {
    console.log(`[Docker] Provisioning container ${envId} with strict quotas:`, config);
    // e.g., dockerode.createContainer({ 
    //   Image: 'ubuntu', 
    //   HostConfig: { Memory: config.memoryLimitMb * 1024 * 1024, NetworkMode: 'none', ReadonlyRootfs: config.readOnlyFilesystem } 
    // })
  }

  async execute(envId: string, command: string[], artifacts: Record<string, string>): Promise<void> {
    console.log(`[Docker] Executing ${command.join(' ')} inside ${envId}`);
    // Attach volumes, start container
  }

  streamLogs(envId: string, onChunk: (chunk: string) => void): void {
    console.log(`[Docker] Attaching stream listener to ${envId}`);
    // container.logs({ follow: true, stdout: true, stderr: true })
    setTimeout(() => onChunk("Compiler started..."), 100);
    setTimeout(() => onChunk("Tests running..."), 500);
  }

  async collectResult(envId: string) {
    console.log(`[Docker] Collecting final artifacts for ${envId}`);
    return { exitCode: 0, durationMs: 1450, artifacts: [] };
  }

  async cleanup(envId: string): Promise<void> {
    console.log(`[Docker] Forcibly destroying container ${envId} and volumes`);
    // container.remove({ force: true, v: true })
  }
}
