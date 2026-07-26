import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.3.4"
    id("io.spring.dependency-management") version "1.1.6"
    kotlin("jvm") version "2.0.20"
    kotlin("plugin.spring") version "2.0.20"
    kotlin("plugin.jpa") version "2.0.20"
}

group = "com.cerebro"
version = "0.1.0"
java.sourceCompatibility = JavaVersion.VERSION_21

repositories { mavenCentral() }

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-cache")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")

    // Kotlin
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")

    // Database
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-database-postgresql")

    // gRPC client → ML service
    implementation("net.devh:grpc-client-spring-boot-starter:3.1.0.RELEASE")
    implementation("io.grpc:grpc-stub:1.68.0")
    implementation("io.grpc:grpc-protobuf:1.68.0")

    // NATS
    implementation("io.nats:jnats:2.20.4")

    // Observability
    implementation("io.micrometer:micrometer-registry-prometheus")
    implementation("io.micrometer:micrometer-tracing-bridge-otel")
    implementation("io.opentelemetry:opentelemetry-exporter-otlp")

    // OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

    // Security (JWT validation via Keycloak JWKS)
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.security:spring-security-oauth2-jose")

    // Utilities
    implementation("com.github.ben-manes.caffeine:caffeine")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("com.h2database:h2")
    testImplementation("io.mockk:mockk:1.13.13")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "21"
    }
}
tasks.withType<Test> { useJUnitPlatform() }
