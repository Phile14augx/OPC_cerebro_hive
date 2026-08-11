# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\company-operating-system-brain.spec.ts >> brain search, focus, select, and inspector
- Location: tests\e2e\company-operating-system-brain.spec.ts:4:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3401/app/brain?mode=demo", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - complementary [ref=e3]:
    - generic [ref=e4]:
      - link "H HivePulse" [ref=e5] [cursor=pointer]:
        - /url: /app/
        - generic [ref=e6]: H
        - generic [ref=e7]: HivePulse
      - button "Collapse sidebar" [ref=e8]
    - generic [ref=e12]:
      - button "CerebroHive Production" [ref=e14]:
        - generic [ref=e21]:
          - generic [ref=e22]: CerebroHive
          - generic [ref=e23]: Production
      - generic [ref=e26]:
        - heading "Pinned" [level=4] [ref=e27]
        - generic [ref=e30]:
          - link "AI Studio" [ref=e31] [cursor=pointer]:
            - /url: /app/ai/studio/
          - link "Workflows" [ref=e37] [cursor=pointer]:
            - /url: /app/automation/workflows/
          - link "Knowledge Hub" [ref=e44] [cursor=pointer]:
            - /url: /app/ai/knowledge/
      - button "CerebroForge™" [ref=e49]
      - generic [ref=e58]:
        - heading "Workspace" [level=4] [ref=e59]
        - generic [ref=e60]:
          - link "Dashboard" [ref=e61] [cursor=pointer]:
            - /url: /app/
          - link "Company Brain" [ref=e68] [cursor=pointer]:
            - /url: /app/brain/
          - link "Organizations" [ref=e82] [cursor=pointer]:
            - /url: /app/organizations/
          - link "Projects" [ref=e88] [cursor=pointer]:
            - /url: /app/projects/
          - link "Teams" [ref=e92] [cursor=pointer]:
            - /url: /app/teams/
      - generic [ref=e99]:
        - heading "AI Platform" [level=4] [ref=e100]
        - generic [ref=e101]:
          - link "AI Overview" [ref=e102] [cursor=pointer]:
            - /url: /app/ai/
          - link "AI Studio" [ref=e109] [cursor=pointer]:
            - /url: /app/ai/studio/
          - link "AI Agents" [ref=e115] [cursor=pointer]:
            - /url: /app/agents/
          - link "AI Workflows" [ref=e120] [cursor=pointer]:
            - /url: /app/workflows/
          - link "AI Playground" [ref=e126] [cursor=pointer]:
            - /url: /app/playground/
          - link "AI Models" [ref=e130] [cursor=pointer]:
            - /url: /app/ai/models/
          - link "Prompt Library" [ref=e137] [cursor=pointer]:
            - /url: /app/ai/prompts/
          - link "Knowledge Hub" [ref=e141] [cursor=pointer]:
            - /url: /app/ai/knowledge/
          - link "Vector Store" [ref=e145] [cursor=pointer]:
            - /url: /app/ai/vectors/
      - generic [ref=e152]:
        - heading "Infrastructure" [level=4] [ref=e153]
        - generic [ref=e154]:
          - link "Infra Overview" [ref=e155] [cursor=pointer]:
            - /url: /app/infrastructure/
          - link "Cloud" [ref=e162] [cursor=pointer]:
            - /url: /app/infrastructure/cloud/
          - link "Deployments" [ref=e166] [cursor=pointer]:
            - /url: /app/infrastructure/deployments/
          - link "Kubernetes" [ref=e173] [cursor=pointer]:
            - /url: /app/infrastructure/kubernetes/
          - link "Databases" [ref=e186] [cursor=pointer]:
            - /url: /app/infrastructure/databases/
          - link "Storage" [ref=e192] [cursor=pointer]:
            - /url: /app/infrastructure/storage/
          - link "Networking" [ref=e196] [cursor=pointer]:
            - /url: /app/infrastructure/networking/
          - link "Edge" [ref=e203] [cursor=pointer]:
            - /url: /app/infrastructure/edge/
          - link "API Gateway" [ref=e208] [cursor=pointer]:
            - /url: /app/infrastructure/gateway/
      - generic [ref=e217]:
        - heading "Data & Security" [level=4] [ref=e218]
        - generic [ref=e219]:
          - link "Data Overview" [ref=e220] [cursor=pointer]:
            - /url: /app/data/
          - link "Data Pipelines" [ref=e227] [cursor=pointer]:
            - /url: /app/data/pipelines/
          - link "ETL" [ref=e233] [cursor=pointer]:
            - /url: /app/data/etl/
          - link "Data Warehouse" [ref=e239] [cursor=pointer]:
            - /url: /app/data/warehouse/
          - link "Lakehouse" [ref=e245] [cursor=pointer]:
            - /url: /app/data/lakehouse/
          - link "Analytics" [ref=e250] [cursor=pointer]:
            - /url: /app/analytics/
          - link "BI" [ref=e255] [cursor=pointer]:
            - /url: /app/data/bi/
          - link "Security Overview" [ref=e260] [cursor=pointer]:
            - /url: /app/trust/security/
          - link "IAM" [ref=e267] [cursor=pointer]:
            - /url: /app/security/iam/
          - link "Roles" [ref=e272] [cursor=pointer]:
            - /url: /app/security/roles/
          - link "Secrets" [ref=e278] [cursor=pointer]:
            - /url: /app/security/secrets/
          - link "Audit Logs" [ref=e284] [cursor=pointer]:
            - /url: /app/trust/audit/
          - link "Compliance" [ref=e289] [cursor=pointer]:
            - /url: /app/trust/compliance/
          - link "Policies" [ref=e294] [cursor=pointer]:
            - /url: /app/trust/policies/
      - generic [ref=e298]:
        - heading "Talent OS" [level=4] [ref=e299]
        - generic [ref=e300]:
          - link "Hiring Pipeline" [ref=e301] [cursor=pointer]:
            - /url: /app/talent/
          - link "Candidates" [ref=e308] [cursor=pointer]:
            - /url: /app/talent/candidates/
          - link "Assessments" [ref=e315] [cursor=pointer]:
            - /url: /app/talent/assessments/
          - link "Assessment Builder" [ref=e319] [cursor=pointer]:
            - /url: /app/talent/builder/
          - link "Question Bank" [ref=e325] [cursor=pointer]:
            - /url: /app/talent/questions/
      - generic [ref=e329]:
        - heading "Explore" [level=4] [ref=e330]
        - generic [ref=e331]:
          - link "Marketplace" [ref=e332] [cursor=pointer]:
            - /url: /app/marketplace/
          - link "Templates" [ref=e338] [cursor=pointer]:
            - /url: /app/templates/
          - link "Industry Packs" [ref=e344] [cursor=pointer]:
            - /url: /app/industry/
          - link "Quantiva ERP" [ref=e350] [cursor=pointer]:
            - /url: /app/quantiva/
          - link "Custom Solutions" [ref=e354] [cursor=pointer]:
            - /url: /app/custom/
  - generic [ref=e360]:
    - banner [ref=e361]:
      - button "CerebroHive" [ref=e364]
      - button "Search, command, or jump to... Ctrl K" [ref=e374]:
        - generic [ref=e375]: Search, command, or jump to...
        - generic [ref=e380]:
          - generic [ref=e381]: Ctrl
          - generic [ref=e382]: K
      - generic [ref=e383]:
        - button "Hive Assistant" [ref=e384]
        - button "Notifications" [ref=e391]
        - button "Account menu" [ref=e397]
    - main [ref=e402]:
      - region "Loading company brain" [ref=e404]:
        - paragraph [ref=e406]: Mapping company brain…
        - generic [ref=e407]: The graph grid, context, core, department edges, departments, and agent ring are appearing.
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { mockCompanyOperatingSystemDemo } from '../company-operating-system-demo';
  3  | 
  4  | test("brain search, focus, select, and inspector", async ({ page }) => {
  5  |   await mockCompanyOperatingSystemDemo(page);
> 6  |   await page.goto("/app/brain?mode=demo");
     |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  7  | 
  8  |   await expect(page.getByText("DEMO DATA")).toBeVisible();
  9  |   await page.getByRole("searchbox", { name: "Search company brain" }).fill("Research");
  10 |   await page.getByRole("button", { name: "Department: Research" }).dblclick();
  11 |   await page.getByRole("button", { name: /Agent:/ }).first().click();
  12 | 
  13 |   await expect(page.getByRole("dialog", { name: /entity detail/i })).toBeVisible();
  14 | });
  15 | 
```