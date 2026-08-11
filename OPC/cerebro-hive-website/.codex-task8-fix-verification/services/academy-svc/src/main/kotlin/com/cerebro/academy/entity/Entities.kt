package com.cerebro.academy.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant

// ── Enums ─────────────────────────────────────────────────────────────────────

enum class CourseLevel  { FOUNDATION, PRACTITIONER, ADVANCED, EXPERT }
enum class CourseCategory { AI_ENGINEERING, ML_ENGINEERING, AI_STRATEGY,
                             AI_OPERATIONS, AI_SECURITY, AI_GOVERNANCE }
enum class EnrollmentStatus { ACTIVE, COMPLETED, PAUSED, CANCELLED }
enum class LicenseTier  { TEAM, DEPARTMENT, ENTERPRISE }

// ── Course ────────────────────────────────────────────────────────────────────

@Entity
@Table(name = "academy_courses")
data class Course(
    @Id val id: String = "",
    val code: String = "",
    val slug: String = "",
    val name: String = "",
    val description: String = "",

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "course_category")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    val category: CourseCategory = CourseCategory.AI_ENGINEERING,

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "course_level")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    val level: CourseLevel = CourseLevel.FOUNDATION,

    val duration: String = "",

    @Column(columnDefinition = "text[]")
    val modules: Array<String> = emptyArray(),

    @Column(columnDefinition = "text[]")
    val outcomes: Array<String> = emptyArray(),

    @Column(columnDefinition = "text[]")
    val prerequisites: Array<String> = emptyArray(),

    val active: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
) {
    override fun equals(other: Any?) = other is Course && id == other.id
    override fun hashCode() = id.hashCode()
}

// ── Learning Path ─────────────────────────────────────────────────────────────

@Entity
@Table(name = "academy_learning_paths")
data class LearningPath(
    @Id val id: String = "",
    val code: String = "",
    val slug: String = "",
    val name: String = "",
    val certTitle: String = "",
    val description: String = "",

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "course_level")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    val level: CourseLevel = CourseLevel.FOUNDATION,

    val durationMin: String = "",
    val durationMax: String = "",

    @Column(columnDefinition = "text[]")
    val courseIds: Array<String> = emptyArray(),

    @Column(columnDefinition = "text[]")
    val outcomes: Array<String> = emptyArray(),

    val active: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
) {
    override fun equals(other: Any?) = other is LearningPath && id == other.id
    override fun hashCode() = id.hashCode()
}

// ── Enrollment ────────────────────────────────────────────────────────────────

@Entity
@Table(name = "academy_enrollments")
data class Enrollment(
    @Id val id: String = "",
    val userId: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    val course: Course = Course(),

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "enrollment_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    val status: EnrollmentStatus = EnrollmentStatus.ACTIVE,

    val progressPct: Short = 0,
    val startedAt: Instant = Instant.now(),
    val completedAt: Instant? = null,
    val updatedAt: Instant = Instant.now(),
) {
    override fun equals(other: Any?) = other is Enrollment && id == other.id
    override fun hashCode() = id.hashCode()
}

// ── Certificate ───────────────────────────────────────────────────────────────

@Entity
@Table(name = "academy_certificates")
data class Certificate(
    @Id val id: String = "",
    val userId: String = "",
    val courseId: String? = null,
    val pathId: String? = null,
    val issuedAt: Instant = Instant.now(),
    val expiresAt: Instant? = null,
    val verifyToken: String = "",
) {
    override fun equals(other: Any?) = other is Certificate && id == other.id
    override fun hashCode() = id.hashCode()
}

// ── Corporate License ─────────────────────────────────────────────────────────

@Entity
@Table(name = "academy_licenses")
data class AcademyLicense(
    @Id val id: String = "",
    val orgId: String = "",

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "license_tier")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    val tier: LicenseTier = LicenseTier.TEAM,

    val seatCount: Int = 1,
    val seatsUsed: Int = 0,
    val validFrom: Instant = Instant.now(),
    val validUntil: Instant? = null,
    val active: Boolean = true,
    val createdAt: Instant = Instant.now(),
) {
    override fun equals(other: Any?) = other is AcademyLicense && id == other.id
    override fun hashCode() = id.hashCode()
}
