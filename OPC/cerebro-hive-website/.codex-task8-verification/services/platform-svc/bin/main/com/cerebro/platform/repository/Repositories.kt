package com.cerebro.platform.repository

import com.cerebro.platform.entity.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ProductRepository : JpaRepository<Product, String> {
    fun findBySlug(slug: String): Optional<Product>
    fun findByTierAndActive(tier: ProductTier, active: Boolean, pageable: Pageable): Page<Product>
    fun findByActive(active: Boolean, pageable: Pageable): Page<Product>

    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
        AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
          OR LOWER(p.tagline) LIKE LOWER(CONCAT('%', :q, '%'))
          OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))
    """)
    fun search(@Param("q") query: String, pageable: Pageable): Page<Product>
}

@Repository
interface ServiceRepository : JpaRepository<ServiceItem, String> {
    fun findByCode(code: String): Optional<ServiceItem>
    fun findBySlug(slug: String): Optional<ServiceItem>
    fun findByPracticeAndActive(practice: ServicePractice, active: Boolean, pageable: Pageable): Page<ServiceItem>
    fun findByActive(active: Boolean, pageable: Pageable): Page<ServiceItem>
}

@Repository
interface IndustryRepository : JpaRepository<Industry, String> {
    fun findBySlug(slug: String): Optional<Industry>
    fun findByActive(active: Boolean, pageable: Pageable): Page<Industry>
}

@Repository
interface SolutionRepository : JpaRepository<Solution, String> {
    fun findBySlug(slug: String): Optional<Solution>
    fun findByActive(active: Boolean, pageable: Pageable): Page<Solution>
    fun findByCategoryAndActive(category: String, active: Boolean, pageable: Pageable): Page<Solution>
}
