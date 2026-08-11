import { Octokit } from "@octokit/rest";
import { verify } from "@octokit/webhooks-methods";
import type { EpicDecomposition } from "../agents/pm-agent/schema";

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

/**
 * Validates the GitHub webhook signature to ensure the payload is authentic.
 */
export async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) throw new Error("GITHUB_WEBHOOK_SECRET is not configured");
  
  return await verify(secret, payload, signature);
}

/**
 * Mutates a GitHub issue with the results of the PM Agent.
 */
export async function updateIssueWithPMAnalysis(
  owner: string,
  repo: string,
  issueNumber: number,
  analysis: EpicDecomposition
) {
  // 1. Add Labels
  if (analysis.labels.length > 0) {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: analysis.labels,
    });
  }

  // 2. Format a rich comment with the generated checklist and story points
  const commentBody = `
### 🧠 Cerebro PM Agent Analysis

**Story Points:** ${analysis.storyPoints}
**Risk Level:** ${analysis.riskLevel.toUpperCase()}
**Suggested Phase:** ${analysis.suggestedPhase}

#### Implementation Checklist
${analysis.checklist.map(item => `- [ ] ${item}`).join('\n')}

#### Dependencies
${analysis.dependencies.length > 0 ? analysis.dependencies.map(dep => `- ${dep}`).join('\n') : "None identified."}
`;

  // 3. Post the comment
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: commentBody,
  });
}

/**
 * Commits a markdown document to a new branch and opens a Pull Request.
 */
export async function createDocumentationPR(
  owner: string,
  repo: string,
  filePath: string,
  content: string,
  title: string,
  branchPrefix: string = "docs/auto"
) {
  // 1. Get default branch (main) reference
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });

  // 2. Create new branch
  const branchName = `${branchPrefix}-${Date.now()}`;
  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: refData.object.sha,
  });

  // 3. Commit file to new branch
  const contentEncoded = Buffer.from(content).toString('base64');
  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `docs: Auto-generate ${title}`,
    content: contentEncoded,
    branch: branchName,
  });

  // 4. Open PR
  await octokit.rest.pulls.create({
    owner,
    repo,
    title: `docs: ${title}`,
    head: branchName,
    base: defaultBranch,
    body: "🤖 **Cerebro PM Agent** generated this documentation. Please review and merge.",
  });
}

