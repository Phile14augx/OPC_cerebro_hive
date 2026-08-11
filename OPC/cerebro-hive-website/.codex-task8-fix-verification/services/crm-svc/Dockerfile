FROM gradle:8.10-jdk21 AS builder
WORKDIR /build
COPY build.gradle.kts settings.gradle.kts ./
RUN gradle dependencies --no-daemon || true
COPY src ./src
RUN gradle bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S cerebro && adduser -S -G cerebro cerebro
WORKDIR /app
COPY --from=builder /build/build/libs/*.jar app.jar
USER cerebro
EXPOSE 8083
ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75 -Djava.security.egd=file:/dev/./urandom"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8083/actuator/health || exit 1
