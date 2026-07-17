# Cerebro Hive Website - Agent Rules

## Workflow Management
- Whenever a GitHub Actions build or workflow fails (or if the user requests to clean up failed builds), automatically delete all failed workflow runs using the GitHub CLI (`gh`).
- **Command to use:**
  ```powershell
  $env:GITHUB_TOKEN = ""; $runs = (gh run list --status failure --limit 100 --json databaseId | ConvertFrom-Json); foreach ($r in $runs) { gh run delete $r.databaseId }
  ```
- **Important Context:** We must explicitly clear the `$env:GITHUB_TOKEN` variable before running the command to ensure `gh` uses the locally authenticated keyring instead of an invalid environment token.
