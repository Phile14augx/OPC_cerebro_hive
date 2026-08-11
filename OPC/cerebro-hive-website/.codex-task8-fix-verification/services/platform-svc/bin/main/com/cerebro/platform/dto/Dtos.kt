package com.cerebro.platform.dto

import com.cerebro.platform.entity.*
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

// ── Product DTOs ──────────────────────────────────────────────────────────────

data class ProductDto(
    val id: String,
    val slug: String,
    val name: String,
    val tagline: String,
    val description: String,
    val tier: ProductTier,
    val tierLabel: String,
    val features: List<String>,
    val integrations: List<String>,
    val useCases: List<String>,
    val sla: String?,
    val active: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant,
)

fun Product.toDto() = ProductDto(
    id, slug, name, tagline, description, tier, tierLabel,
    features.toList(), integrations.toList(), useCases.toList(),
    sla, active, createdAt, updatedAt,
)

data class CreateProductRequest(
    @field:NotBlank val slug: String,
    @field:NotBlank val name: String,
    @field:NotBlank val tagline: String,
    @field:NotBlank val description: String,
    val tier: ProductTier,
    @field:NotBlank val tierLabel: String,
    val features: List<String> = emptyList(),
    val integrations: List<String> = emptyList(),
    val useCases: List<String> = emptyList(),
    val sla: String? = null,
)

data class UpdateProductRequest(
    val name: String? = null,
    val tagline: String? = null,
    val description: String? = null,
    val features: List<String>? = null,
    val sla: String? = null,
    val active: Boolean? = null,
)

// ── Service DTOs ──────────────────────────────────────────────────────────────

data class ServiceItemDto(
    val id: String,
    val code: String,
    val slug: String,
    val name: String,
    val tagline: String,
    val description: String,
    val practice: ServicePractice,
    val timeline: String,
    val investment: String,
    val deliverables: List<String>,
    val outcomes: List<String>,
    val active: Boolean,
)

fun ServiceItem.toDto() = ServiceItemDto(
    id, code, slug, name, tagline, description, practice,
    timeline, investment, deliverables.toList(), outcomes.toList(), active,
)

// ── Industry DTOs ─────────────────────────────────────────────────────────────

data class UseCaseDto(
    val id: String,
    val name: String,
    val description: String,
    val products: List<String>,
    val roi: String?,
)

fun IndustryUseCase.toDto() = UseCaseDto(id, name, description, products.toList(), roi)

data class IndustryDto(
    val id: String,
    val slug: String,
    val name: String,
    val tagline: String,
    val overview: String,
    val compliance: List<String>,
    val metrics: List<String>,
    val icon: String?,
    val color: String?,
    val useCases: List<UseCaseDto>,
    val active: Boolean,
)

fun Industry.toDto() = IndustryDto(
    id, slug, name, tagline, overview,
    compliance.toList(), metrics.toList(), icon, color,
    useCases.map { it.toDto() }, active,
)

// ── Solution DTOs ─────────────────────────────────────────────────────────────

data class SolutionDto(
    val id: String,
    val slug: String,
    val name: String,
    val category: String,
    val tagline: String,
    val description: String,
    val deliverables: List<String>,
    val timeline: String,
    val investment: String,
    val outcomes: List<String>,
    val products: List<String>,
    val services: List<String>,
    val methodology: String?,
    val active: Boolean,
)

fun Solution.toDto() = SolutionDto(
    id, slug, name, category, tagline, description,
    deliverables.toList(), timeline, investment,
    outcomes.toList(), products.toList(), services.toList(), methodology, active,
)

// ── Search ────────────────────────────────────────────────────────────────────

data class SearchResult(val id: String, val type: String, val slug: String, val name: String, val excerpt: String)

fun Product.toSearchResult() = SearchResult(id, "product", slug, name, tagline)
fun ServiceItem.toSearchResult() = SearchResult(id, "service", slug, name, tagline)
fun Industry.toSearchResult() = SearchResult(id, "industry", slug, name, tagline)
fun Solution.toSearchResult() = SearchResult(id, "solution", slug, name, tagline)

data class GlobalSearchResult(
    val products: List<SearchResult>,
    val services: List<SearchResult>,
    val industries: List<SearchResult>,
    val solutions: List<SearchResult>,
)
