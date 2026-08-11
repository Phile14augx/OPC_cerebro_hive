```yaml
name: services/crm-svc
language: Kotlin
framework: Spring Boot (Gradle)
entrypoint: src/main/kotlin/com/cerebro/crm/CrmApplication.kt
protocol: HTTP
deployment: standalone JVM service (Dockerfile present)
consumes:
  - unread
produces:
  - unread — has CrmController.kt
health: not yet confirmed
owner: unknown
confidence: structural
duplicate: None known.
status: >
  Real Spring Boot service, same template as platform-svc/academy-svc. Business logic not read. Reached via services/gateway's /api/v1/crm.
notes: >
  (none)
```
