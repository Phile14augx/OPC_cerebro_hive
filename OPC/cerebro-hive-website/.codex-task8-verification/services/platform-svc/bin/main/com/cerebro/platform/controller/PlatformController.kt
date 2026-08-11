package com.cerebro.platform.controller

import com.cerebro.platform.dto.*
import com.cerebro.platform.entity.ProductTier
import com.cerebro.platform.entity.ServicePractice
import com.cerebro.platform.service.PlatformService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

// ── Products ──────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Platform product catalog")
@SecurityRequirement(name = "bearerAuth")
class ProductController(private val svc: PlatformService) {

    @GetMapping
    @Operation(summary = "List all products, optionally filtered by tier")
    fun listProducts(
        @RequestParam(required = false) tier: ProductTier?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
    ) = svc.listProducts(tier, PageRequest.of(page, size.coerceAtMost(100)))

    @GetMapping("/{slug}")
    @Operation(summary = "Get product by slug")
    fun getProduct(@PathVariable slug: String) =
        ResponseEntity.ok(svc.getProductBySlug(slug))

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('admin')")
    @Operation(summary = "Create product (admin only)")
    fun createProduct(@Valid @RequestBody req: CreateProductRequest) =
        svc.createProduct(req)

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    @Operation(summary = "Update product (admin only)")
    fun updateProduct(@PathVariable id: String, @Valid @RequestBody req: UpdateProductRequest) =
        svc.updateProduct(id, req)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('admin')")
    fun deleteProduct(@PathVariable id: String) = svc.deleteProduct(id)

    @GetMapping("/search")
    @Operation(summary = "Full-text search across products")
    fun search(
        @RequestParam q: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ) = svc.searchProducts(q, PageRequest.of(page, size.coerceAtMost(50)))
}

// ── Services ──────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/services")
@Tag(name = "Services", description = "Professional services catalog")
@SecurityRequirement(name = "bearerAuth")
class ServiceController(private val svc: PlatformService) {

    @GetMapping
    fun listServices(
        @RequestParam(required = false) practice: ServicePractice?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
    ) = svc.listServices(practice, PageRequest.of(page, size.coerceAtMost(100)))

    @GetMapping("/{slug}")
    fun getService(@PathVariable slug: String) =
        ResponseEntity.ok(svc.getServiceBySlug(slug))
}

// ── Industries ────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/industries")
@Tag(name = "Industries", description = "Industry programs")
@SecurityRequirement(name = "bearerAuth")
class IndustryController(private val svc: PlatformService) {

    @GetMapping
    fun listIndustries(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ) = svc.listIndustries(PageRequest.of(page, size.coerceAtMost(50)))

    @GetMapping("/{slug}")
    fun getIndustry(@PathVariable slug: String) =
        ResponseEntity.ok(svc.getIndustryBySlug(slug))
}

// ── Solutions ─────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/solutions")
@Tag(name = "Solutions", description = "Solution packages")
@SecurityRequirement(name = "bearerAuth")
class SolutionController(private val svc: PlatformService) {

    @GetMapping
    fun listSolutions(
        @RequestParam(required = false) category: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ) = svc.listSolutions(category, PageRequest.of(page, size.coerceAtMost(50)))

    @GetMapping("/{slug}")
    fun getSolution(@PathVariable slug: String) =
        ResponseEntity.ok(svc.getSolutionBySlug(slug))
}

// ── Global Search ─────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/search")
@Tag(name = "Search")
class SearchController(private val svc: PlatformService) {

    @GetMapping
    @Operation(summary = "Search across products, services, industries, and solutions")
    fun search(
        @RequestParam q: String,
        @RequestParam(defaultValue = "10") limit: Int,
    ) = svc.globalSearch(q, limit.coerceAtMost(50))
}
