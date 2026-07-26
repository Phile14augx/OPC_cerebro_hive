package com.cerebro.academy.config

import io.nats.client.Connection
import io.nats.client.Nats
import io.nats.client.Options
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain

@Configuration
class NatsConfig {
    @Bean
    fun natsConnection(@Value("\${nats.url}") url: String): Connection =
        Nats.connect(Options.Builder().server(url).connectionName("academy-svc")
            .reconnectWait(java.time.Duration.ofSeconds(2)).maxReconnects(-1).build())
}

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers(
                    "/actuator/health", "/actuator/info",
                    "/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                    "/api/v1/academy/certificates/verify/**",
                ).permitAll()
                it.anyRequest().authenticated()
            }
            .oauth2ResourceServer { it.jwt {} }
        return http.build()
    }
}

@Configuration
class OpenApiConfig {
    @Bean
    fun openAPI() = OpenAPI()
        .info(Info().title("CerebroHive Academy Service").version("v1"))
        .schemaRequirement("bearerAuth",
            SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT"))
}
