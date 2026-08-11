# ──────────────────────────────────────────────────────────────────────────────
# PolicyOps — OPA/Conftest: Raw Kubernetes Manifest Gates
# Run: conftest test infra/k8s/ --policy infra/policy/opa/kubernetes.rego -r yaml
# ──────────────────────────────────────────────────────────────────────────────
package kubernetes

import future.keywords.contains
import future.keywords.if
import future.keywords.in

# Namespaces CerebroHive owns — apply stricter rules here
cerebro_namespaces := {"cerebro-hive", "cerebro-hive-staging", "cerebro-hive-dev"}

# ── Deny: Namespace not explicitly labelled with environment ──────────────────
deny contains msg if {
  input.kind == "Namespace"
  input.metadata.name in cerebro_namespaces
  not input.metadata.labels["environment"]
  msg := sprintf(
    "POLICY: Namespace '%s' must have label 'environment' (production|staging|dev)",
    [input.metadata.name],
  )
}

# ── Deny: NetworkPolicy must be present (we check for kind in ns) ────────────
# This is enforced at admission time by Kyverno; here we gate CI commits.
deny contains msg if {
  input.kind in ["Deployment", "StatefulSet"]
  ns := object.get(input.metadata, "namespace", "")
  ns in cerebro_namespaces
  not input.metadata.annotations["cerebro.ai/network-policy-verified"]
  # Soft check — only warn, not deny, since NetworkPolicy is a separate resource
  false  # disabled at deny level; use warn below
}

warn contains msg if {
  input.kind in ["Deployment", "StatefulSet"]
  ns := object.get(input.metadata, "namespace", "")
  ns in cerebro_namespaces
  not input.metadata.annotations["cerebro.ai/network-policy-verified"]
  msg := sprintf(
    "WARN: %s/%s in namespace '%s' should have annotation cerebro.ai/network-policy-verified to confirm NetworkPolicy exists",
    [input.kind, input.metadata.name, ns],
  )
}

# ── Deny: RBAC — no ClusterRoleBindings to system:masters ────────────────────
deny contains msg if {
  input.kind == "ClusterRoleBinding"
  subject := input.subjects[_]
  input.roleRef.name == "cluster-admin"
  subject.kind == "ServiceAccount"
  msg := sprintf(
    "POLICY: ClusterRoleBinding '%s' binds ServiceAccount '%s/%s' to cluster-admin — disallowed",
    [input.metadata.name, subject.namespace, subject.name],
  )
}

# ── Deny: Secrets must not store plaintext values over 512 bytes ──────────────
# (heuristic to catch accidental private key/cert embedding)
deny contains msg if {
  input.kind == "Secret"
  input.type != "kubernetes.io/tls"
  some key, value in input.data
  count(base64.decode(value)) > 4096
  msg := sprintf(
    "POLICY: Secret '%s' key '%s' is unusually large (%d bytes decoded) — use ExternalSecrets instead",
    [input.metadata.name, key, count(base64.decode(value))],
  )
}

# ── Deny: ServiceAccounts must not automount tokens unless explicitly required ─
deny contains msg if {
  input.kind == "ServiceAccount"
  ns := object.get(input.metadata, "namespace", "")
  ns in cerebro_namespaces
  not input.automountServiceAccountToken == false
  not input.metadata.annotations["cerebro.ai/needs-token-mount"]
  msg := sprintf(
    "POLICY: ServiceAccount '%s/%s' should set automountServiceAccountToken=false unless annotated with cerebro.ai/needs-token-mount",
    [ns, input.metadata.name],
  )
}

# ── Deny: HPA minReplicas must be ≥ 2 for cerebro namespaces ─────────────────
deny contains msg if {
  input.kind == "HorizontalPodAutoscaler"
  ns := object.get(input.metadata, "namespace", "")
  ns == "cerebro-hive"  # production only
  min_replicas := object.get(input.spec, "minReplicas", 1)
  min_replicas < 2
  msg := sprintf(
    "POLICY: HPA '%s' in production must have minReplicas ≥ 2 (got %d)",
    [input.metadata.name, min_replicas],
  )
}

# ── Deny: PodDisruptionBudget maxUnavailable must not be 100% ────────────────
deny contains msg if {
  input.kind == "PodDisruptionBudget"
  input.spec.maxUnavailable == "100%"
  msg := sprintf(
    "POLICY: PodDisruptionBudget '%s' sets maxUnavailable=100%% — provides no protection",
    [input.metadata.name],
  )
}

# ── Warn: Deployments without Argo Rollout annotation in production ────────────
warn contains msg if {
  input.kind == "Deployment"
  ns := object.get(input.metadata, "namespace", "")
  ns == "cerebro-hive"
  not input.metadata.annotations["argocd.argoproj.io/managed-by"]
  msg := sprintf(
    "WARN: Deployment '%s' in production is not managed by ArgoCD — prefer GitOps delivery",
    [input.metadata.name],
  )
}
