{{/*
Expand the name of the chart.
*/}}
{{- define "cerebro-hive.name" -}}
{{- default .Chart.Name .Values.global.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "cerebro-hive.fullname" -}}
{{- if .Values.global.fullnameOverride }}
{{- .Values.global.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Chart label
*/}}
{{- define "cerebro-hive.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cerebro-hive.labels" -}}
helm.sh/chart: {{ include "cerebro-hive.chart" . }}
app.kubernetes.io/part-of: {{ include "cerebro-hive.name" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Values.global.imageTag | default .Chart.AppVersion | quote }}
environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Selector labels for a given service
Usage: {{ include "cerebro-hive.selectorLabels" (dict "service" "studio" "root" .) }}
*/}}
{{- define "cerebro-hive.selectorLabels" -}}
app.kubernetes.io/name: {{ .service }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/part-of: {{ include "cerebro-hive.name" .root }}
{{- end }}

{{/*
ServiceAccount name
*/}}
{{- define "cerebro-hive.serviceAccountName" -}}
{{- if .Values.serviceAccount.name }}
{{- .Values.serviceAccount.name }}
{{- else }}
{{- include "cerebro-hive.fullname" . }}
{{- end }}
{{- end }}

{{/*
Image tag helper — prefer explicit tag, fall back to chart appVersion
*/}}
{{- define "cerebro-hive.imageTag" -}}
{{- .tag | default $.Chart.AppVersion }}
{{- end }}
