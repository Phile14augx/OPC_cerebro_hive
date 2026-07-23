{{/*
CerebroHive Helm Chart — Template Helpers
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "cerebro-hive.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "cerebro-hive.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart label value.
*/}}
{{- define "cerebro-hive.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels applied to every resource.
*/}}
{{- define "cerebro-hive.labels" -}}
helm.sh/chart: {{ include "cerebro-hive.chart" . }}
{{ include "cerebro-hive.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: cerebro-hive
{{- end }}

{{/*
Selector labels (used in matchLabels + selector).
*/}}
{{- define "cerebro-hive.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cerebro-hive.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Service-specific labels. Takes a dict with "root" (.) and "svc" (service name).
*/}}
{{- define "cerebro-hive.serviceLabels" -}}
helm.sh/chart: {{ include "cerebro-hive.chart" .root }}
app.kubernetes.io/name: {{ .svc }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/component: {{ .svc }}
app.kubernetes.io/part-of: cerebro-hive
app.kubernetes.io/managed-by: {{ .root.Release.Service }}
{{- if .root.Chart.AppVersion }}
app.kubernetes.io/version: {{ .root.Chart.AppVersion | quote }}
{{- end }}
{{- end }}

{{/*
Service-specific selector labels.
*/}}
{{- define "cerebro-hive.serviceSelectorLabels" -}}
app.kubernetes.io/name: {{ .svc }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
{{- end }}

{{/*
Image reference helper. Takes a dict with "registry", "repository", "tag", "pullPolicy".
*/}}
{{- define "cerebro-hive.image" -}}
{{- $registry := .registry | default "" }}
{{- $repo := .repository }}
{{- $tag := .tag | default "latest" }}
{{- if $registry }}
{{- printf "%s/%s:%s" $registry $repo $tag }}
{{- else }}
{{- printf "%s:%s" $repo $tag }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account for a given service.
*/}}
{{- define "cerebro-hive.serviceAccountName" -}}
{{- $svc := .svc -}}
{{- $cfg := .cfg -}}
{{- if $cfg.serviceAccount -}}
  {{- if $cfg.serviceAccount.create -}}
    {{- default $svc $cfg.serviceAccount.name }}
  {{- else -}}
    {{- default "default" $cfg.serviceAccount.name }}
  {{- end -}}
{{- else -}}
  {{- $svc }}
{{- end -}}
{{- end }}

{{/*
Standard security context for pods.
*/}}
{{- define "cerebro-hive.podSecurityContext" -}}
runAsNonRoot: true
runAsUser: 1001
runAsGroup: 1001
fsGroup: 1001
seccompProfile:
  type: RuntimeDefault
{{- end }}

{{/*
Standard security context for containers.
*/}}
{{- define "cerebro-hive.containerSecurityContext" -}}
allowPrivilegeEscalation: false
readOnlyRootFilesystem: true
capabilities:
  drop:
    - ALL
{{- end }}

{{/*
Standard topology spread constraints — zone + node.
*/}}
{{- define "cerebro-hive.topologySpreadConstraints" -}}
- maxSkew: 1
  topologyKey: topology.kubernetes.io/zone
  whenUnsatisfiable: DoNotSchedule
  labelSelector:
    matchLabels:
      app.kubernetes.io/name: {{ . }}
- maxSkew: 1
  topologyKey: kubernetes.io/hostname
  whenUnsatisfiable: ScheduleAnyway
  labelSelector:
    matchLabels:
      app.kubernetes.io/name: {{ . }}
{{- end }}

{{/*
Standard OTel environment variables.
*/}}
{{- define "cerebro-hive.otelEnv" -}}
- name: OTEL_SERVICE_NAME
  value: {{ . | quote }}
- name: OTEL_EXPORTER_OTLP_ENDPOINT
  value: {{ $.Values.global.otel.endpoint | quote }}
- name: OTEL_TRACES_EXPORTER
  value: "otlp"
- name: OTEL_METRICS_EXPORTER
  value: "otlp"
- name: OTEL_LOGS_EXPORTER
  value: "otlp"
{{- end }}

{{/*
Render HPA target metrics list.
*/}}
{{- define "cerebro-hive.hpaMetrics" -}}
{{- $cfg := .cfg -}}
- type: Resource
  resource:
    name: cpu
    target:
      type: Utilization
      averageUtilization: {{ $cfg.hpa.targetCPUUtilizationPercentage | default 70 }}
{{- if $cfg.hpa.targetMemoryUtilizationPercentage }}
- type: Resource
  resource:
    name: memory
    target:
      type: Utilization
      averageUtilization: {{ $cfg.hpa.targetMemoryUtilizationPercentage }}
{{- end }}
{{- end }}
