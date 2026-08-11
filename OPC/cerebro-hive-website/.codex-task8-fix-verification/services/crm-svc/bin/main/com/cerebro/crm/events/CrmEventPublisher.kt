package com.cerebro.crm.events

import com.cerebro.crm.entity.*
import com.fasterxml.jackson.databind.ObjectMapper
import io.nats.client.Connection
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import java.time.Instant

@Component
class CrmEventPublisher(private val nats: Connection, private val json: ObjectMapper) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Async fun leadSubmitted(l: Lead) = publish("crm.lead.submitted", mapOf(
        "leadId" to l.id, "contactId" to l.contact.id, "email" to l.contact.email,
        "engagementType" to l.engagementType.name, "timestamp" to Instant.now().toString()))

    @Async fun leadStatusChanged(l: Lead, note: String) = publish("crm.lead.status_changed", mapOf(
        "leadId" to l.id, "status" to l.status.name, "note" to note,
        "timestamp" to Instant.now().toString()))

    @Async fun bookingCreated(b: Booking) = publish("crm.booking.created", mapOf(
        "bookingId" to b.id, "contactId" to b.contact.id,
        "meetingType" to b.meetingType, "timestamp" to Instant.now().toString()))

    @Async fun referralRegistered(r: Referral) = publish("crm.referral.registered", mapOf(
        "referralId" to r.id, "referrerId" to r.referrerId,
        "referredEmail" to r.referredEmail, "timestamp" to Instant.now().toString()))

    private fun publish(subject: String, payload: Map<String, Any>) {
        try { nats.publish(subject, json.writeValueAsBytes(payload)) }
        catch (ex: Exception) { log.error("NATS publish failed {}: {}", subject, ex.message) }
    }
}
