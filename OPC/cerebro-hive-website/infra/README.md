# Infrastructure Architecture: Terraform & CDK

This document defines the strict ownership boundary between Terraform and AWS CDK within the CerebroHive infrastructure.

## Terraform Ownership
Terraform is responsible for all core, long-lived infrastructure. This includes:
- **VPC** (networking, subnets, routing)
- **EKS** (Kubernetes clusters and node groups)
- **RDS** (Database instances)
- **IAM** (Roles and policies for core services)
- **ArgoCD** (GitOps deployment)

Terraform configurations are located in `infra/terraform/modules/*`.

## CDK Ownership
AWS CDK has a very narrow, specific scope. It is **only** responsible for:
- **cerebro-review-stack**: ephemeral preview environments

CDK configurations are located in `infra/aws/`. It is not intended as a competing IaC choice for core infrastructure.

## Architecture Decision Rationale
These tools do not overlap; do not consolidate them. Terraform is the standard for core infrastructure state, while CDK is optimized for rapid provisioning of temporary review stacks directly tied to PR lifecycles.

For more details on this decision, reference `MASTER-PLAN-EVOLUTION-LOG.md` §3.

## Known Debt
- **Naming Inconsistency**: There is an existing inconsistency in Terraform regarding `environments/` vs `envs/` naming conventions. This is a known debt item and should be addressed in a dedicated refactoring cycle, not silently fixed during feature work.
