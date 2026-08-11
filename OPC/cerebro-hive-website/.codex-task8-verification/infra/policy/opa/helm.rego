# ──────────────────────────────────────────────────────────────────────────────
# PolicyOps — OPA/Conftest: Helm Rendered Manifest Gates
# Run: helm template . | conftest test - --policy infra/policy/opa/helm.rego
# ──────────────────────────────────────────────────────────────────────────────
package helm

import future.keywords.contains
import future.keywords.if
import future.keywords.in

# ── Deny: Containers without resource limits ──────────────────────────────────
deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet", "Job"]
  container := input.spec.template.spec.containers[_]
  not container.resources.limits.cpu
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s must define resources.limits.cpu",
    [container.name, input.kind, input.metadata.name],
  )
}

deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet", "Job"]
  container := input.spec.template.spec.containers[_]
  not container.resources.limits.memory
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s must define resources.limits.memory",
    [container.name, input.kind, input.metadata.name],
  )
}

# ── Deny: Containers without security context ─────────────────────────────────
deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet"]
  container := input.spec.template.spec.containers[_]
  not container.securityContext.readOnlyRootFilesystem == true
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s must set securityContext.readOnlyRootFilesystem=true",
    [container.name, input.kind, input.metadata.name],
  )
}

deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet"]
  container := input.spec.template.spec.containers[_]
  container.securityContext.allowPrivilegeEscalation == true
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s must NOT set allowPrivilegeEscalation=true",
    [container.name, input.kind, input.metadata.name],
  )
}

deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet"]
  not input.spec.template.spec.securityContext.runAsNonRoot == true
  msg := sprintf(
    "POLICY: Pod spec in %s/%s must set securityContext.runAsNonRoot=true",
    [input.kind, input.metadata.name],
  )
}

# ── Deny: Latest image tag ────────────────────────────────────────────────────
deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet", "Job"]
  container := input.spec.template.spec.containers[_]
  endswith(container.image, ":latest")
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s must not use ':latest' image tag",
    [container.name, input.kind, input.metadata.name],
  )
}

deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet", "Job"]
  container := input.spec.template.spec.containers[_]
  not contains(container.image, ":")
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s image must have an explicit tag",
    [container.name, input.kind, input.metadata.name],
  )
}

# ── Deny: No liveness/readiness probes ───────────────────────────────────────
deny contains msg if {
  input.kind in ["Deployment", "StatefulSet"]
  container := input.spec.template.spec.containers[_]
  not container.livenessProbe
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s must define a livenessProbe",
    [container.name, input.kind, input.metadata.name],
  )
}

deny contains msg if {
  input.kind in ["Deployment", "StatefulSet"]
  container := input.spec.template.spec.containers[_]
  not container.readinessProbe
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s must define a readinessProbe",
    [container.name, input.kind, input.metadata.name],
  )
}

# ── Deny: Services must not use NodePort ──────────────────────────────────────
deny contains msg if {
  input.kind == "Service"
  input.spec.type == "NodePort"
  msg := sprintf(
    "POLICY: Service '%s' must not use NodePort type — use ClusterIP with Ingress or LoadBalancer",
    [input.metadata.name],
  )
}

# ── Deny: Ingress without TLS configured ──────────────────────────────────────
deny contains msg if {
  input.kind == "Ingress"
  count(input.spec.tls) == 0
  msg := sprintf(
    "POLICY: Ingress '%s' must configure TLS",
    [input.metadata.name],
  )
}

# ── Deny: Missing required labels ────────────────────────────────────────────
deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet"]
  required := {"app.kubernetes.io/name", "app.kubernetes.io/component"}
  labels := object.get(input.metadata, "labels", {})
  missing := {k | k := required[_]; not labels[k]}
  count(missing) > 0
  msg := sprintf(
    "POLICY: %s/%s is missing required labels: %v",
    [input.kind, input.metadata.name, missing],
  )
}

# ── Deny: Privileged containers ──────────────────────────────────────────────
deny contains msg if {
  input.kind in ["Deployment", "StatefulSet", "DaemonSet"]
  container := input.spec.template.spec.containers[_]
  container.securityContext.privileged == true
  msg := sprintf(
    "POLICY: Container '%s' in %s/%s must not run as privileged",
    [container.name, input.kind, input.metadata.name],
  )
}

# ── Warn: No topology spread constraints ─────────────────────────────────────
warn contains msg if {
  input.kind == "Deployment"
  replicas := object.get(input.spec, "replicas", 1)
  replicas > 1
  not input.spec.template.spec.topologySpreadConstraints
  msg := sprintf(
    "WARN: Deployment '%s' has %d replicas but no topologySpreadConstraints — risk of zone co-location",
    [input.metadata.name, replicas],
  )
}

# ── Warn: No PodDisruptionBudget label ────────────────────────────────────────
warn contains msg if {
  input.kind == "Deployment"
  replicas := object.get(input.spec, "replicas", 1)
  replicas > 1
  labels := object.get(input.metadata, "annotations", {})
  not labels["cerebro.ai/has-pdb"]
  msg := sprintf(
    "WARN: Deployment '%s' has %d replicas — ensure a PodDisruptionBudget is configured",
    [input.metadata.name, replicas],
  )
}
