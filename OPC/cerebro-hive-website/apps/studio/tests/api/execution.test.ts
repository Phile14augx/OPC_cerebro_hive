import { ExecutionService } from "../../lib/talent/infrastructure/execution/ExecutionService";
import { MockSandboxProvider, MockStreamingProvider } from "../../lib/talent/infrastructure/execution/providers/MockProviders";
import { DockerExecutionProvider } from "../../lib/talent/infrastructure/execution/DockerExecutionProvider";
import { EvaluationEngine, AIReviewEngine } from "../../lib/talent/engine/evaluation";

describe("Talent execution honesty", () => {
  it("refuses to queue candidate code when execution tables are absent", async () => {
    const service = new ExecutionService();
    await expect(service.submitExecution()).rejects.toThrow("TALENT_EXECUTION_NOT_IMPLEMENTED");
  });

  it("does not eval candidate code in the mock sandbox", async () => {
    const sandbox = new MockSandboxProvider(new MockStreamingProvider(), "job_test");
    await expect(sandbox.execute("javascript", "throw new Error('should not run')")).rejects.toThrow(
      "TALENT_SANDBOX_NOT_IMPLEMENTED"
    );
  });

  it("does not report a successful docker exit without a container", async () => {
    const docker = new DockerExecutionProvider();
    await expect(docker.collectResult("env-1")).rejects.toThrow("DOCKER_EXECUTION_NOT_IMPLEMENTED");
  });

  it("does not invent deterministic or qualitative scores", async () => {
    const engine = new EvaluationEngine();
    expect(() => engine.evaluateDeterministic({} as never, [])).toThrow("TALENT_EVALUATION_NOT_IMPLEMENTED");
    await expect(new AIReviewEngine().performQualitativeReview({} as never, { criteria: [] } as never, {} as never)).rejects.toThrow(
      "TALENT_AI_REVIEW_NOT_IMPLEMENTED"
    );
  });
});
