{{- /*
Common labels
*/ -}}
{{- define "example-service.labels" -}}
helm.sh/chart: {{ include "example-service.chart" . }}
{{ include "example-service.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- /*
Selector labels
*/ -}}
{{- define "example-service.selectorLabels" -}}
app.kubernetes.io/name: example-service
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- /*
Chart name and version
*/ -}}
{{- define "example-service.chart" -}}
{{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- /*
Fullname
*/ -}}
{{- define "example-service.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{- /*
Service account name
*/ -}}
{{- define "example-service.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "example-service.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
