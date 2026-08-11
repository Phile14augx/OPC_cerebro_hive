package com.cerebro.platform.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.Instant

// ── Enums ─────────────────────────────────────────────────────────────────────

enum class ProductTier {
    TIER_0_FOUNDATION,
    TIER_1_INFRASTRUCTURE,
    TIER_2_DATA_INTELLIGENCE,
    TIER_3_AI_RUNTIME,
    TIER_4_CEREBRO_APPS,
    TIER_5_ECOSYSTEM
}

enum class ServicePractice {
    STRATEGY, ENGINEERING, OPERATIONS, SECURITY, INDUSTRY
}

// ── Product ───────────────────────────────────────────────────────────────────

@Entity
@Table(name = "platform_products")
data class Product(
    @Id val id: String = "",
    @Column(unique = true, nullable = false) val slug: String = "",
    @Column(nullable = false) var name: String = "",
    @Column(nullable = false) var tagline: String = "",
    @Column(columnDefinition = "TEXT", nullable = false) var description: String = "",

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    @Column(columnDefinition = "product_tier", nullable = false)
    val tier: ProductTier = ProductTier.TIER_0_FOUNDATION,

    @Column(name = "tier_label", nullable = false) var tierLabel: String = "",

    @Column(columnDefinition = "TEXT[]") var features: Array<String> = emptyArray(),
    @Column(columnDefinition = "TEXT[]") var integrations: Array<String> = emptyArray(),
    @Column(name = "use_cases", columnDefinition = "TEXT[]") var useCases: Array<String> = emptyArray(),
    var sla: String? = null,
    var active: Boolean = true,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)

// ── Service ───────────────────────────────────────────────────────────────────

@Entity
@Table(name = "platform_services")
data class ServiceItem(
    @Id val id: String = "",
    @Column(unique = true, nullable = false) val code: String = "",
    @Column(unique = true, nullable = false) val slug: String = "",
    @Column(nullable = false) var name: String = "",
    @Column(nullable = false) var tagline: String = "",
    @Column(columnDefinition = "TEXT") var description: String = "",

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    @Column(columnDefinition = "service_practice", nullable = false)
    val practice: ServicePractice = ServicePractice.STRATEGY,

    var timeline: String = "",
    var investment: String = "",
    @Column(columnDefinition = "TEXT[]") var deliverables: Array<String> = emptyArray(),
    @Column(columnDefinition = "TEXT[]") var outcomes: Array<String> = emptyArray(),
    var active: Boolean = true,
    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at") var updatedAt: Instant = Instant.now()
)

// ── Industry ──────────────────────────────────────────────────────────────────

@Entity
@Table(name = "platform_industries")
data class Industry(
    @Id val id: String = "",
    @Column(unique = true, nullable = false) val slug: String = "",
    @Column(nullable = false) var name: String = "",
    @Column(nullable = false) var tagline: String = "",
    @Column(columnDefinition = "TEXT") var overview: String = "",
    @Column(columnDefinition = "TEXT[]") var compliance: Array<String> = emptyArray(),
    @Column(columnDefinition = "TEXT[]") var metrics: Array<String> = emptyArray(),
    var icon: String? = null,
    var color: String? = null,
    var active: Boolean = true,

    @OneToMany(mappedBy = "industry", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var useCases: MutableList<IndustryUseCase> = mutableListOf(),

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at") var updatedAt: Instant = Instant.now()
)

@Entity
@Table(name = "industry_use_cases")
data class IndustryUseCase(
    @Id val id: String = "",
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_id", nullable = false)
    val industry: Industry = Industry(),
    @Column(nullable = false) var name: String = "",
    @Column(columnDefinition = "TEXT") var description: String = "",
    @Column(columnDefinition = "TEXT[]") var products: Array<String> = emptyArray(),
    var roi: String? = null,
    @Column(name = "sort_order") var sortOrder: Int = 0
)

// ── Solution ──────────────────────────────────────────────────────────────────

@Entity
@Table(name = "platform_solutions")
data class Solution(
    @Id val id: String = "",
    @Column(unique = true, nullable = false) val slug: String = "",
    @Column(nullable = false) var name: String = "",
    @Column(nullable = false) var category: String = "",
    @Column(nullable = false) var tagline: String = "",
    @Column(columnDefinition = "TEXT") var description: String = "",
    @Column(columnDefinition = "TEXT[]") var deliverables: Array<String> = emptyArray(),
    var timeline: String = "",
    var investment: String = "",
    @Column(columnDefinition = "TEXT[]") var outcomes: Array<String> = emptyArray(),
    @Column(columnDefinition = "TEXT[]") var products: Array<String> = emptyArray(),
    @Column(columnDefinition = "TEXT[]") var services: Array<String> = emptyArray(),
    @Column(columnDefinition = "TEXT") var methodology: String? = null,
    var active: Boolean = true,
    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at") var updatedAt: Instant = Instant.now()
)
