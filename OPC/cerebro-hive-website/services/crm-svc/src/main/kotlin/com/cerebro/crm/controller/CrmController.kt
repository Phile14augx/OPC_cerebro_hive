package com.cerebro.crm.controller

import com.cerebro.crm.dto.*
import com.cerebro.crm.entity.*
import com.cerebro.crm.service.*
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

// ── Contacts ──────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/crm/contacts")
class ContactController(private val svc: ContactService) {

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasRole('sales')")
    fun get(@PathVariable id: String) = svc.getById(id)
}

// ── Leads ─────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/crm/leads")
class LeadController(private val svc: LeadService) {

    // Public — used by website contact form
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun submit(@Valid @RequestBody req: SubmitLeadRequest) = svc.submit(req)

    @GetMapping
    @PreAuthorize("hasRole('admin') or hasRole('sales')")
    fun list(@RequestParam(required = false) status: LeadStatus?,
             @PageableDefault(size = 25) pageable: Pageable) =
        if (status != null) svc.listByStatus(status, pageable) else svc.list(pageable)

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasRole('sales')")
    fun get(@PathVariable id: String) = svc.get(id)

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('admin') or hasRole('sales')")
    fun updateStatus(@PathVariable id: String,
                     @Valid @RequestBody req: UpdateLeadStatusRequest) =
        svc.updateStatus(id, req)
}

// ── Bookings ──────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/crm/bookings")
class BookingController(private val svc: BookingService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody req: CreateBookingRequest) = svc.create(req)

    @GetMapping("/{id}")
    fun get(@PathVariable id: String) = svc.get(id)

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('admin') or hasRole('sales')")
    fun updateStatus(@PathVariable id: String,
                     @RequestParam status: BookingStatus) = svc.updateStatus(id, status)
}

// ── Referrals ─────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/v1/crm/referrals")
class ReferralController(private val svc: ReferralService) {

    @GetMapping
    fun list(@AuthenticationPrincipal jwt: Jwt) = svc.listForReferrer(jwt.subject)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun register(@AuthenticationPrincipal jwt: Jwt,
                 @Valid @RequestBody req: RegisterReferralRequest) =
        svc.register(jwt.subject, req)

    @PatchMapping("/{id}/convert")
    @PreAuthorize("hasRole('admin')")
    fun convert(@PathVariable id: String) = svc.markConverted(id)
}
