```yaml
name: services/academy-svc
language: Kotlin
framework: Spring Boot (Gradle)
entrypoint: src/main/kotlin/com/cerebro/academy/AcademyApplication.kt
protocol: HTTP
deployment: standalone JVM service (Dockerfile present)
consumes:
  - unread
produces:
  - unread — has AcademyController.kt
health: not yet confirmed
owner: unknown
confidence: structural
duplicate: None known.
status: >
  Real Spring Boot service, same template as platform-svc/crm-svc. Business logic not read. Reached via services/gateway's /api/v1/academy.
notes: >
  (none)
```
