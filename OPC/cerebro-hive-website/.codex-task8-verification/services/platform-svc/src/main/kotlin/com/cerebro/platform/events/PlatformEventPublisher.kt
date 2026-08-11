package com.cerebro.platform.events

import com.cerebro.platform.entity.Product
import com.fasterxml.jackson.databind.ObjectMapper
import io.nats.client.Connection
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import java.time.Instant

@Component
class PlatformEventPublisher(
    private val nats: Connection,
    private val json: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Async
    fun productCreated(product: Product) = publish("platform.product.created", mapOf(
        "id" to product.id, "slug" to product.slug, "name" to product.name,
        "tier" to product.tier.name, "timestamp" to Instant.now().toString(),
    ))

    @Async
    fun productUpdated(product: Product) = publish("platform.product.updated", mapOf(
        "id" to product.id, "slug" to product.slug, "timestamp" to Instant.now().toString(),
    ))

    @Async
    fun productDeleted(id: String) = publish("platform.product.deleted", mapOf(
        "id" to id, "timestamp" to Instant.now().toString(),
    ))

    private fun publish(subject: String, payload: Map<String, Any>) {
        try {
            nats.publish(subject, json.writeValueAsBytes(payload))
            log.debug("Published NATS event: {}", subject)
        } catch (e: Exception) {
            log.error("Failed to publish NATS event {}: {}", subject, e.message)
        }
    }
}
