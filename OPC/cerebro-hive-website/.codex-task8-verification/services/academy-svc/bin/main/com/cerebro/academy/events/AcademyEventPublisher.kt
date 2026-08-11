package com.cerebro.academy.events

import com.cerebro.academy.entity.Course
import com.cerebro.academy.entity.Enrollment
import com.fasterxml.jackson.databind.ObjectMapper
import io.nats.client.Connection
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import java.time.Instant

@Component
class AcademyEventPublisher(private val nats: Connection, private val json: ObjectMapper) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Async fun courseCreated(c: Course) = publish("academy.course.created", mapOf(
        "id" to c.id, "slug" to c.slug, "name" to c.name, "timestamp" to Instant.now().toString()))

    @Async fun enrolled(e: Enrollment) = publish("academy.enrollment.created", mapOf(
        "enrollmentId" to e.id, "userId" to e.userId, "courseId" to e.course.id,
        "timestamp" to Instant.now().toString()))

    @Async fun courseCompleted(e: Enrollment) = publish("academy.enrollment.completed", mapOf(
        "enrollmentId" to e.id, "userId" to e.userId, "courseId" to e.course.id,
        "completedAt" to (e.completedAt ?: Instant.now()).toString()))

    private fun publish(subject: String, payload: Map<String, Any>) {
        try {
            nats.publish(subject, json.writeValueAsBytes(payload))
        } catch (ex: Exception) {
            log.error("Failed to publish NATS event {}: {}", subject, ex.message)
        }
    }
}
