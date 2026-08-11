import { decomposeEpic } from "../lib/agents/pm-agent/provider";
import { EPIC_DECOMPOSITION_PROMPT_V1 } from "../lib/agents/pm-agent/prompts/v1-epic-decomposition";
import "dotenv/config";

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is missing from environment variables.");
    process.exit(1);
  }

  const mockEpicTitle = "[EPIC]: Universal Knowledge Graph Integration";
  const mockEpicBody = `
### Executive Summary
We need to integrate a vector database and build a unified Knowledge Graph that all internal AI agents can query to fetch context about enterprise assets.

### Acceptance Criteria
- [ ] Vector DB deployed (Pinecone)
- [ ] Ingestion pipeline built for Notion docs
- [ ] Graph relationships established between departments and documents
  `;

  console.log("🚀 Testing Cerebro PM Agent V1...");
  console.log("Simulating webhook payload...");

  try {
    const analysis = await decomposeEpic(
      mockEpicTitle,
      mockEpicBody,
      EPIC_DECOMPOSITION_PROMPT_V1,
      `test_${Date.now()}`
    );

    console.log("\n✅ AI Analysis Complete! Zod Schema Validated successfully.\n");
    console.log(JSON.stringify(analysis, null, 2));

  } catch (error) {
    console.error("\n❌ Agent Execution Failed:\n", error);
  }
}

main();
