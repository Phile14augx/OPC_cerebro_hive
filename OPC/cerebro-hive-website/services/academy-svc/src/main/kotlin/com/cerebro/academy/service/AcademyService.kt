package com.cerebro.academy.service

import com.cerebro.academy.dto.*
import com.cerebro.academy.entity.*
import com.cerebro.academy.events.AcademyEventPublisher
import com.cerebro.academy.repository.*
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus
import java.time.Instant
import java.util.UUID

// ── CourseService ─────────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class CourseService(
    private val courses: CourseRepository,
    private val enrollments: EnrollmentRepository,
    private val events: AcademyEventPublisher,
) {
    @Cacheable("courses")
    fun list(pageable: Pageable): Page<CourseDto> =
        courses.findByActiveTrue(pageable).map { it.toDto(enrollments.countByCourseId(it.id)) }

    @Cacheable("courses", key = "#slug")
    fun getBySlug(slug: String): CourseDto =
        courses.findBySlug(slug).map { it.toDto(enrollments.countByCourseId(it.id)) }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: $slug") }

    fun search(q: String, pageable: Pageable): Page<CourseDto> =
        courses.search(q, pageable).map { it.toDto() }

    @Transactional
    @CacheEvict("courses", allEntries = true)
    fun create(req: CreateCourseRequest): CourseDto {
        val course = courses.save(Course(
            id = "crs_${UUID.randomUUID()}",
            code = req.code, slug = req.slug, name = req.name,
            description = req.description, category = req.category, level = req.level,
            duration = req.duration,
            modules = req.modules.toTypedArray(),
            outcomes = req.outcomes.toTypedArray(),
            prerequisites = req.prerequisites.toTypedArray(),
        ))
        events.courseCreated(course)
        return course.toDto()
    }
}

// ── LearningPathService ───────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class LearningPathService(private val paths: LearningPathRepository) {

    @Cacheable("learning-paths")
    fun list(pageable: Pageable): Page<LearningPathDto> =
        paths.findByActiveTrue(pageable).map { it.toDto() }

    fun getBySlug(slug: String): LearningPathDto =
        paths.findBySlug(slug).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Learning path not found: $slug") }

    @Transactional
    @CacheEvict("learning-paths", allEntries = true)
    fun create(entity: LearningPath): LearningPathDto = paths.save(entity).toDto()
}

// ── EnrollmentService ─────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class EnrollmentService(
    private val enrollments: EnrollmentRepository,
    private val courses: CourseRepository,
    private val certs: CertificateRepository,
    private val events: AcademyEventPublisher,
) {
    fun listForUser(userId: String, pageable: Pageable): Page<EnrollmentDto> =
        enrollments.findByUserId(userId, pageable).map { it.toDto() }

    fun get(id: String): EnrollmentDto =
        enrollments.findById(id).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment $id not found") }

    @Transactional
    fun enroll(userId: String, req: EnrollRequest): EnrollmentDto {
        val course = courses.findById(req.courseId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Course ${req.courseId} not found") }

        // Idempotent — return existing if already enrolled
        val existing = enrollments.findByUserIdAndCourseId(userId, req.courseId)
        if (existing.isPresent) return existing.get().toDto()

        val enrollment = enrollments.save(Enrollment(
            id = "enr_${UUID.randomUUID()}",
            userId = userId,
            course = course,
            status = EnrollmentStatus.ACTIVE,
        ))
        events.enrolled(enrollment)
        return enrollment.toDto()
    }

    @Transactional
    fun updateProgress(id: String, req: UpdateProgressRequest): EnrollmentDto {
        val e = enrollments.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }

        val completedAt = if (req.progressPct >= 100) Instant.now() else e.completedAt
        val newStatus   = if (req.progressPct >= 100) EnrollmentStatus.COMPLETED else e.status

        val updated = enrollments.save(e.copy(
            progressPct = req.progressPct,
            status = newStatus,
            completedAt = completedAt,
        ))
        if (newStatus == EnrollmentStatus.COMPLETED) events.courseCompleted(updated)
        return updated.toDto()
    }
}

// ── CertificateService ────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class CertificateService(private val certs: CertificateRepository) {

    fun listForUser(userId: String): List<CertificateDto> =
        certs.findByUserId(userId).map { it.toDto() }

    fun verify(token: String): CertificateDto =
        certs.findByVerifyToken(token).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate not found") }

    @Transactional
    fun issue(userId: String, req: IssueCertificateRequest): CertificateDto {
        val cert = certs.save(Certificate(
            id = "cert_${UUID.randomUUID()}",
            userId = userId,
            courseId = req.courseId,
            pathId = req.pathId,
            verifyToken = UUID.randomUUID().toString(),
        ))
        return cert.toDto()
    }
}

// ── LicenseService ────────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class LicenseService(private val licenses: LicenseRepository) {

    fun listForOrg(orgId: String): List<LicenseDto> =
        licenses.findByOrgIdAndActiveTrue(orgId).map { it.toDto() }

    @Transactional
    fun create(req: CreateLicenseRequest): LicenseDto {
        val lic = licenses.save(AcademyLicense(
            id = "lic_${UUID.randomUUID()}",
            orgId = req.orgId, tier = req.tier,
            seatCount = req.seatCount, validUntil = req.validUntil,
        ))
        return lic.toDto()
    }

    @Transactional
    fun assignSeat(licenseId: String): LicenseDto {
        val lic = licenses.findById(licenseId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "License $licenseId not found") }
        if (lic.seatsUsed >= lic.seatCount)
            throw ResponseStatusException(HttpStatus.CONFLICT, "No seats available")
        return licenses.save(lic.copy(seatsUsed = lic.seatsUsed + 1)).toDto()
    }
}
