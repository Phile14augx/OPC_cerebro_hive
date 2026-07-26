package com.cerebro.platform.service

import com.cerebro.platform.dto.*
import com.cerebro.platform.entity.*
import com.cerebro.platform.events.PlatformEventPublisher
import com.cerebro.platform.repository.*
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
@Transactional(readOnly = true)
class PlatformService(
    private val products: ProductRepository,
    private val services: ServiceRepository,
    private val industries: IndustryRepository,
    private val solutions: SolutionRepository,
    private val events: PlatformEventPublisher,
) {

    // ── Products ──────────────────────────────────────────────────────────────

    @Cacheable("products-list", key = "#tier?.name() + ':' + #pageable.pageNumber")
    fun listProducts(tier: ProductTier?, pageable: Pageable): Page<ProductDto> {
        return if (tier != null)
            products.findByTierAndActive(tier, true, pageable).map { it.toDto() }
        else
            products.findByActive(true, pageable).map { it.toDto() }
    }

    @Cacheable("product", key = "#slug")
    fun getProductBySlug(slug: String): ProductDto =
        products.findBySlug(slug).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: $slug") }

    @Transactional
    @CacheEvict("products-list", allEntries = true)
    fun createProduct(req: CreateProductRequest): ProductDto {
        val product = Product(
            id = "prod_${UUID.randomUUID().toString().replace("-", "")}",
            slug = req.slug,
            name = req.name,
            tagline = req.tagline,
            description = req.description,
            tier = req.tier,
            tierLabel = req.tierLabel,
            features = req.features.toTypedArray(),
            integrations = req.integrations.toTypedArray(),
            useCases = req.useCases.toTypedArray(),
            sla = req.sla,
        )
        val saved = products.save(product)
        events.productCreated(saved)
        return saved.toDto()
    }

    @Transactional
    @CacheEvict(value = ["products-list", "product"], allEntries = true)
    fun updateProduct(id: String, req: UpdateProductRequest): ProductDto {
        val product = products.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: $id") }
        req.name?.let { product.name = it }
        req.tagline?.let { product.tagline = it }
        req.description?.let { product.description = it }
        req.features?.let { product.features = it.toTypedArray() }
        req.sla?.let { product.sla = it }
        req.active?.let { /* handled by delete */ }
        product.updatedAt = Instant.now()
        val saved = products.save(product)
        events.productUpdated(saved)
        return saved.toDto()
    }

    @Transactional
    @CacheEvict(value = ["products-list", "product"], allEntries = true)
    fun deleteProduct(id: String) {
        val product = products.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: $id") }
        products.delete(product)
        events.productDeleted(id)
    }

    fun searchProducts(query: String, pageable: Pageable): Page<ProductDto> =
        products.search(query, pageable).map { it.toDto() }

    // ── Services ──────────────────────────────────────────────────────────────

    @Cacheable("services-list", key = "#practice?.name() + ':' + #pageable.pageNumber")
    fun listServices(practice: ServicePractice?, pageable: Pageable): Page<ServiceItemDto> =
        if (practice != null)
            services.findByPracticeAndActive(practice, true, pageable).map { it.toDto() }
        else
            services.findByActive(true, pageable).map { it.toDto() }

    @Cacheable("service", key = "#slug")
    fun getServiceBySlug(slug: String): ServiceItemDto =
        services.findBySlug(slug).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found: $slug") }

    // ── Industries ────────────────────────────────────────────────────────────

    @Cacheable("industries-list", key = "#pageable.pageNumber")
    fun listIndustries(pageable: Pageable): Page<IndustryDto> =
        industries.findByActive(true, pageable).map { it.toDto() }

    @Cacheable("industry", key = "#slug")
    fun getIndustryBySlug(slug: String): IndustryDto =
        industries.findBySlug(slug).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Industry not found: $slug") }

    // ── Solutions ─────────────────────────────────────────────────────────────

    @Cacheable("solutions-list", key = "#category + ':' + #pageable.pageNumber")
    fun listSolutions(category: String?, pageable: Pageable): Page<SolutionDto> =
        if (category != null)
            solutions.findByCategoryAndActive(category, true, pageable).map { it.toDto() }
        else
            solutions.findByActive(true, pageable).map { it.toDto() }

    @Cacheable("solution", key = "#slug")
    fun getSolutionBySlug(slug: String): SolutionDto =
        solutions.findBySlug(slug).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Solution not found: $slug") }

    // ── Global search ─────────────────────────────────────────────────────────

    fun globalSearch(query: String, limit: Int): GlobalSearchResult {
        val pageable = PageRequest.of(0, limit)
        return GlobalSearchResult(
            products   = products.search(query, pageable).content.map { it.toSearchResult() },
            services   = services.findByActive(true, pageable).filter {
                it.name.contains(query, ignoreCase = true) || it.description.contains(query, ignoreCase = true)
            }.map { it.toSearchResult() },
            industries = industries.findByActive(true, pageable).filter {
                it.name.contains(query, ignoreCase = true)
            }.map { it.toSearchResult() },
            solutions  = solutions.findByActive(true, pageable).filter {
                it.name.contains(query, ignoreCase = true)
            }.map { it.toSearchResult() },
        )
    }
}
