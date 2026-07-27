```yaml
name: services/platform-svc
language: Kotlin
framework: Spring Boot (Gradle)
entrypoint: src/main/kotlin/com/cerebro/platform/PlatformApplication.kt
protocol: HTTP
deployment: standalone JVM service (Dockerfile present)
consumes:
  - unread
produces:
  - unread — has PlatformController.kt
health: not yet confirmed
owner: unknown
confidence: structural
duplicate: This is a 4th, unrelated meaning of "platform" in this repo (root website /platform/* marketing routes, apps/platform dead Next.js runtime, apps/platform-api Fastify backend, and this Kotlin service).
status: >
  Real Spring Boot service (Config/Controller/Dto/Entity/EventPublisher/Repository/Service file structure confirmed). Business logic not read line-by-line. Reached via services/gateway's /api/v1/platform.
notes: >
  Committed .gradle/.kotlin/bin/build directories contain compiled artifacts that probably should be gitignored — a repo hygiene note, not a functional issue.
```
