# CerebroHive — CI/CD Activation Guide

The full pipeline is designed. To make it operational, complete these steps in order.

---

## Step 1 — Push to GitHub

```bash
cd <project-root>
git init
git add .
git commit -m "feat(ci): initial platform with full CI/CD pipeline"
git remote add origin https://github.com/cerebrohive/cerebro-hive-website.git
git push -u origin main
```

This triggers `ci.yml` immediately on the first push.

---

## Step 2 — Add GitHub Secrets

Go to **GitHub → Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `ARGOCD_TOKEN` | ArgoCD API token (from `argocd account generate-token`) |
| `TF_AWS_ACCESS_KEY_ID` | AWS IAM key for Terraform |
| `TF_AWS_SECRET_ACCESS_KEY` | AWS IAM secret for Terraform |
| `NPM_TOKEN` | npm token for semantic-release package publishing |
| `CHROMATIC_PROJECT_TOKEN` | Chromatic project token for visual regression |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for alert notifications |

---

## Step 3 — Bootstrap AWS Infrastructure (Terraform)

```bash
# Create S3 backend bucket first (one-time, manual)
aws s3api create-bucket \
  --bucket cerebro-hive-terraform-state \
  --region us-east-1

aws dynamodb create-table \
  --table-name cerebro-hive-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Deploy staging
cd infra/terraform/environments/staging
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Deploy production
cd ../production
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

---

## Step 4 — Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Install Argo Rollouts
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Apply AppProject + Applications
kubectl apply -f infra/argocd/app-project.yaml
kubectl apply -f infra/argocd/application-staging.yaml
kubectl apply -f infra/argocd/application-production.yaml
kubectl apply -f infra/argocd/application-monitoring.yaml
```

---

## Step 5 — Create K8s Secrets

```bash
# Create the shared secrets bundle (fill in real values)
kubectl create secret generic cerebro-hive-secrets \
  --namespace cerebro-hive \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=REDIS_URL="redis://..." \
  --from-literal=ANTHROPIC_API_KEY="sk-ant-..." \
  --from-literal=grafana-admin-password="changeme" \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

## Step 6 — Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.enabled=false \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

---

## What runs automatically after setup

| Event | What triggers |
|-------|---------------|
| Push to `main` | `ci.yml` — typecheck, lint, unit tests, Go/Python/JVM builds, bundle analysis, Storybook |
| Push to `main` | `docker-build.yml` — builds and pushes all 18 Docker images to GHCR |
| Push to `main` | ArgoCD auto-syncs staging within ~2 min |
| PR touching `infra/` | `policy-gate.yml` — OPA Conftest on Terraform, Helm, K8s; Kyverno validate |
| Every Tue + Thu 10:00 UTC | `release-train.yml` — full test suite → staging deploy → smoke tests → release PR |
| Release PR merged | `release-train.yml` → semantic-release tag → production deploy via ArgoCD + Argo Rollouts canary |
| PR | `security-codeql.yml` — CodeQL SAST on TypeScript/Go/Python |
| PR | `lighthouse-ci.yml` — performance/accessibility audit on studio |
| Manual trigger | `load-test.yml` — k6 load test against staging |
| Manual trigger | `llmops-eval-gate.yml` — LLM eval suite |
