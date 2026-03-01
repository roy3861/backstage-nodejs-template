{{- /*
Common labels
*/ -}}
{{`{{- define "` }}${{ values.name }}{{`.labels" -}}`}}
helm.sh/chart: {{`{{ include "` }}${{ values.name }}{{`.chart" . }}`}}
{{`{{ include "` }}${{ values.name }}{{`.selectorLabels" . }}`}}
app.kubernetes.io/version: {{`{{ .Chart.AppVersion | quote }}`}}
app.kubernetes.io/managed-by: {{`{{ .Release.Service }}`}}
{{`{{- end }}`}}

{{- /*
Selector labels
*/ -}}
{{`{{- define "` }}${{ values.name }}{{`.selectorLabels" -}}`}}
app.kubernetes.io/name: ${{ values.name }}
app.kubernetes.io/instance: {{`{{ .Release.Name }}`}}
{{`{{- end }}`}}

{{- /*
Chart name and version
*/ -}}
{{`{{- define "` }}${{ values.name }}{{`.chart" -}}`}}
{{`{{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}`}}
{{`{{- end }}`}}

{{- /*
Fullname
*/ -}}
{{`{{- define "` }}${{ values.name }}{{`.fullname" -}}`}}
{{`{{- if .Values.fullnameOverride }}`}}
{{`{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}`}}
{{`{{- else }}`}}
{{`{{- $name := default .Chart.Name .Values.nameOverride }}`}}
{{`{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}`}}
{{`{{- end }}`}}
{{`{{- end }}`}}

{{- /*
Service account name
*/ -}}
{{`{{- define "` }}${{ values.name }}{{`.serviceAccountName" -}}`}}
{{`{{- if .Values.serviceAccount.create }}`}}
{{`{{- default (include "` }}${{ values.name }}{{`.fullname" .) .Values.serviceAccount.name }}`}}
{{`{{- else }}`}}
{{`{{- default "default" .Values.serviceAccount.name }}`}}
{{`{{- end }}`}}
{{`{{- end }}`}}
