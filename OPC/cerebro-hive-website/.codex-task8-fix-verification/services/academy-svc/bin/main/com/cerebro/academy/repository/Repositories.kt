package com.cerebro.academy.repository

import com.cerebro.academy.entity.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface CourseRepository : JpaRepository<Course, String> {
    fun findBySlug(slug: String): Optional<Course>
    fun findByActiveTrue(pageable: Pageable): Page<Course>
    fun findByCategoryAndActiveTrue(category: CourseCategory, pageable: Pageable): Page<Course>
    fun findByLevelAndActiveTrue(level: CourseLevel, pageable: Pageable): Page<Course>

    @Query("SELECT c FROM Course c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%',:q,'%'))")
    fun search(q: String, pageable: Pageable): Page<Course>
}

@Repository
interface LearningPathRepository : JpaRepository<LearningPath, String> {
    fun findBySlug(slug: String): Optional<LearningPath>
    fun findByActiveTrue(pageable: Pageable): Page<LearningPath>
}

@Repository
interface EnrollmentRepository : JpaRepository<Enrollment, String> {
    fun findByUserId(userId: String, pageable: Pageable): Page<Enrollment>
    fun findByUserIdAndCourseId(userId: String, courseId: String): Optional<Enrollment>
    fun countByCourseId(courseId: String): Long
    fun findByStatus(status: EnrollmentStatus, pageable: Pageable): Page<Enrollment>
}

@Repository
interface CertificateRepository : JpaRepository<Certificate, String> {
    fun findByUserId(userId: String): List<Certificate>
    fun findByVerifyToken(token: String): Optional<Certificate>
}

@Repository
interface LicenseRepository : JpaRepository<AcademyLicense, String> {
    fun findByOrgIdAndActiveTrue(orgId: String): List<AcademyLicense>
}
