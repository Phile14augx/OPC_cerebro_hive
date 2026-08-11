package com.cerebro.academy.controller

import com.cerebro.academy.dto.*
import com.cerebro.academy.service.*
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

// ── Courses ───────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/academy/courses")
class CourseController(private val svc: CourseService) {

    @GetMapping
    fun list(@PageableDefault(size = 20) pageable: Pageable) = svc.list(pageable)

    @GetMapping("/{slug}")
    fun get(@PathVariable slug: String) = svc.getBySlug(slug)

    @GetMapping("/search")
    fun search(@RequestParam q: String,
               @PageableDefault(size = 20) pageable: Pageable) = svc.search(q, pageable)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('admin')")
    fun create(@Valid @RequestBody req: CreateCourseRequest) = svc.create(req)
}

// ── Learning Paths ────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/academy/learning-paths")
class LearningPathController(private val svc: LearningPathService) {

    @GetMapping
    fun list(@PageableDefault(size = 10) pageable: Pageable) = svc.list(pageable)

    @GetMapping("/{slug}")
    fun get(@PathVariable slug: String) = svc.getBySlug(slug)
}

// ── Enrollments ───────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/academy/enrollments")
class EnrollmentController(private val svc: EnrollmentService) {

    @GetMapping
    fun list(@AuthenticationPrincipal jwt: Jwt,
             @PageableDefault(size = 20) pageable: Pageable) =
        svc.listForUser(jwt.subject, pageable)

    @GetMapping("/{id}")
    fun get(@PathVariable id: String) = svc.get(id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun enroll(@AuthenticationPrincipal jwt: Jwt,
               @Valid @RequestBody req: EnrollRequest) =
        svc.enroll(jwt.subject, req)

    @PatchMapping("/{id}/progress")
    fun updateProgress(@PathVariable id: String,
                       @Valid @RequestBody req: UpdateProgressRequest) =
        svc.updateProgress(id, req)
}

// ── Certificates ──────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/academy/certificates")
class CertificateController(private val svc: CertificateService) {

    @GetMapping
    fun list(@AuthenticationPrincipal jwt: Jwt) = svc.listForUser(jwt.subject)

    @GetMapping("/verify/{token}")
    fun verify(@PathVariable token: String) = svc.verify(token)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun issue(@AuthenticationPrincipal jwt: Jwt,
              @Valid @RequestBody req: IssueCertificateRequest) =
        svc.issue(jwt.subject, req)
}

// ── Licenses ──────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/academy/licenses")
class LicenseController(private val svc: LicenseService) {

    @GetMapping("/org/{orgId}")
    @PreAuthorize("hasRole('admin')")
    fun listForOrg(@PathVariable orgId: String) = svc.listForOrg(orgId)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('admin')")
    fun create(@Valid @RequestBody req: CreateLicenseRequest) = svc.create(req)

    @PostMapping("/{licenseId}/assign")
    @PreAuthorize("hasRole('admin')")
    fun assign(@PathVariable licenseId: String) = svc.assignSeat(licenseId)
}
