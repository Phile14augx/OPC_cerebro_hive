
import { execFileSync } from "child_process";

const PROJECT_ID = "PVT_kwHODEu8Xs4Bdv71";
const STATUS_FIELD_ID = "PVTSSF_lAHODEu8Xs4Bdv71zhYPQNs";
const DONE_OPTION_ID = "98236657";

const query = `
query {
  node(id: "${PROJECT_ID}") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content {
            ... on DraftIssue {
              body
            }
          }
        }
      }
    }
  }
}
`;

console.log("Fetching items...");
const resultBuffer = execFileSync("gh.exe", ["api", "graphql", "-f", `query=${query}`], {
  env: { ...process.env }
});

const result = JSON.parse(resultBuffer.toString());
const items = result.data.node.items.nodes;

console.log(`Found ${items.length} items. Processing...`);

const mutation = `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
  updateProjectV2ItemFieldValue(input: {
    projectId: $projectId,
    itemId: $itemId,
    fieldId: $fieldId,
    value: { singleSelectOptionId: $optionId }
  }) {
    projectV2Item { id }
  }
}`;

let movedCount = 0;

for (const item of items) {
  if (item.content && item.content.body && item.content.body.includes("**Status:** Done")) {
    try {
      execFileSync("gh.exe", [
        "api", "graphql",
        "-f", `projectId=${PROJECT_ID}`,
        "-f", `itemId=${item.id}`,
        "-f", `fieldId=${STATUS_FIELD_ID}`,
        "-f", `optionId=${DONE_OPTION_ID}`,
        "-f", `query=${mutation}`
      ], {
        env: { ...process.env },
        stdio: "ignore"
      });
      console.log(`Moved item ${item.id} to Done`);
      movedCount++;
    } catch (e) {
      console.error(`Failed to move item ${item.id}`);
    }
  }
}

console.log(`Successfully moved ${movedCount} items to Done!`);

