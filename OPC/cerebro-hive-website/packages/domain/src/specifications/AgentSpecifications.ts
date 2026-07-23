export class MaximumToolsSpecification {
  constructor(private maxTools: number = 50) {}

  isSatisfiedBy(tools: any[]): boolean {
    return tools.length <= this.maxTools;
  }
}

export class AgentVersionSpecification {
  isSatisfiedBy(version: number): boolean {
    return version > 0;
  }
}
