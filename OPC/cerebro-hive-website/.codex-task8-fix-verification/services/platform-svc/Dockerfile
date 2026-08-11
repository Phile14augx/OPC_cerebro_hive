# ── Build ──────────────────────────────────────────────────────────────────────
FROM gradle:8.10-jdk21 AS builder
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts* gradle.properties* ./
RUN gradle dependencies --no-daemon 2>/dev/null || true
COPY src ./src
RUN gradle bootJar --no-daemon -x test

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S cerebro && adduser -S cerebro -G cerebro
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
USER cerebro
EXPOSE 3001
HEALTHCHECK --interval=20s --timeout=5s CMD wget -qO- http://localhost:3001/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseZGC", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
