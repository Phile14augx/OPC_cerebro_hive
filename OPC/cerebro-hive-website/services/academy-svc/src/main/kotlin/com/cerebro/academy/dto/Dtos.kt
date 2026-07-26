package com.cerebro.academy.dto

import com.cerebro.academy.entity.*
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.Instant

// ── Course ────────────────────────────────────────────────────────────────────

data class CourseDto(
    val id: String, val code: String, val slug: String, val name: String,
    val description: String, val category: CourseCategory, val level: CourseLevel,
    val duration: String, val modules: List<String>, val outcomes: List<String>,
    val prerequisites: List<String>, val active: Boolean,
    val enrollmentCount: Long = 0,
)

fun Course.toDto(enrollmentCount: Long = 0) = CourseDto(
    id, code, slug, name, description, category, level,
    duration, modules.toList(), outcomes.toList(), prerequisites.toList(), active, enrollmentCount,
)

data class CreateCourseRequest(
    @field:NotBlank val code: String,
    @field:NotBlank val slug: String,
    @field:NotBlank val name: String,
    val description: String = "",
    val category: CourseCategory,
    val level: CourseLevel,
    val duration: String = "",
    val modules: List<String> = emptyList(),
    val outcomes: List<String> = emptyList(),
    val prerequisites: List<String> = emptyList(),
)

// ── Learning Path ─────────────────────────────────────────────────────────────

data class LearningPathDto(
    val id: String, val code: String, val slug: String, val name: String,
    val certTitle: String, val description: String, val level: CourseLevel,
    val durationMin: String, val durationMax: String, val courseIds: List<String>,
    val outcomes: List<String>, val active: Boolean,
)

fun LearningPath.toDto() = LearningPathDto(
    id, code, slug, name, certTitle, description, level,
    durationMin, durationMax, courseIds.toList(), outcomes.toList(), active,
)

// ── Enrollment ────────────────────────────────────────────────────────────────

data class EnrollmentDto(
    val id: String, val userId: String, val courseId: String, val courseName: String,
    val status: EnrollmentStatus, val progressPct: Short,
    val startedAt: Instant, val completedAt: Instant?, val updatedAt: Instant,
)

fun Enrollment.toDto() = EnrollmentDto(
    id, userId, course.id, course.name, status, progressPct, startedAt, completedAt, updatedAt,
)

data class EnrollRequest(@field:NotBlank val courseId: String)

data class UpdateProgressRequest(
    @field:Min(0) @field:Max(100) val progressPct: Short,
)

// ── Certificate ───────────────────────────────────────────────────────────────

data class CertificateDto(
    val id: String, val userId: String, val courseId: String?, val pathId: String?,
    val issuedAt: Instant, val expiresAt: Instant?, val verifyToken: String,
)

fun Certificate.toDto() = CertificateDto(id, userId, courseId, pathId, issuedAt, expiresAt, verifyToken)

data class IssueCertificateRequest(
    val courseId: String? = null,
    val pathId: String? = null,
)

// ── License ───────────────────────────────────────────────────────────────────

data class LicenseDto(
    val id: String, val orgId: String, val tier: LicenseTier,
    val seatCount: Int, val seatsUsed: Int, val seatsAvailable: Int,
    val validFrom: Instant, val validUntil: Instant?, val active: Boolean,
)

fun AcademyLicense.toDto() = LicenseDto(
    id, orgId, tier, seatCount, seatsUsed, seatCount - seatsUsed, validFrom, validUntil, active,
)

data class CreateLicenseRequest(
    @field:NotBlank val orgId: String,
    val tier: LicenseTier,
    @field:Min(1) val seatCount: Int,
    val validUntil: Instant? = null,
)

data class AssignLicenseRequest(@field:NotBlank val userId: String)
