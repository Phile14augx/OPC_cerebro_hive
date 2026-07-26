package com.cerebro.crm.service

import com.cerebro.crm.dto.*
import com.cerebro.crm.entity.*
import com.cerebro.crm.events.CrmEventPublisher
import com.cerebro.crm.repository.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

// ── ContactService ────────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class ContactService(private val contacts: ContactRepository) {

    fun getById(id: String): ContactDto =
        contacts.findById(id).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Contact $id not found") }

    fun getByEmail(email: String): ContactDto =
        contacts.findByEmail(email).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Contact not found") }

    @Transactional
    fun upsertFromLead(req: SubmitLeadRequest): Contact {
        val existing = contacts.findByEmail(req.email)
        if (existing.isPresent) return existing.get()
        return contacts.save(Contact(
            id = "con_${UUID.randomUUID()}",
            email = req.email, firstName = req.firstName, lastName = req.lastName,
            company = req.company, jobTitle = req.jobTitle, industry = req.industry,
            companySize = req.companySize, region = req.region, phone = req.phone,
        ))
    }
}

// ── LeadService ───────────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class LeadService(
    private val leads: LeadRepository,
    private val contacts: ContactRepository,
    private val contactSvc: ContactService,
    private val events: CrmEventPublisher,
) {
    fun list(pageable: Pageable): Page<LeadDto> = leads.findAllByScoreDesc(pageable).map { it.toDto() }

    fun listByStatus(status: LeadStatus, pageable: Pageable): Page<LeadDto> =
        leads.findByStatus(status, pageable).map { it.toDto() }

    fun get(id: String): LeadDto =
        leads.findById(id).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Lead $id not found") }

    @Transactional
    fun submit(req: SubmitLeadRequest): LeadDto {
        val contact = contactSvc.upsertFromLead(req)
        val lead = leads.save(Lead(
            id = "lead_${UUID.randomUUID()}",
            contact = contact,
            engagementType = req.engagementType,
            message = req.message,
            productsInterested = req.productsInterested.toTypedArray(),
            source = req.source,
        ))
        events.leadSubmitted(lead)
        return lead.toDto()
    }

    @Transactional
    fun updateStatus(id: String, req: UpdateLeadStatusRequest): LeadDto {
        val lead = leads.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        val updated = leads.save(lead.copy(status = req.status))
        events.leadStatusChanged(updated, req.note)
        return updated.toDto()
    }

    @Transactional
    fun updateScore(id: String, score: Double, grade: String): LeadDto {
        val lead = leads.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        return leads.save(lead.copy(
            score = java.math.BigDecimal.valueOf(score),
            grade = grade,
        )).toDto()
    }
}

// ── BookingService ────────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class BookingService(
    private val bookings: BookingRepository,
    private val contacts: ContactRepository,
    private val events: CrmEventPublisher,
) {
    fun get(id: String): BookingDto =
        bookings.findById(id).map { it.toDto() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Booking $id not found") }

    fun listByContact(contactId: String, pageable: Pageable): Page<BookingDto> =
        bookings.findByContactId(contactId, pageable).map { it.toDto() }

    @Transactional
    fun create(req: CreateBookingRequest): BookingDto {
        val contact = contacts.findById(req.contactId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Contact ${req.contactId} not found") }
        val booking = bookings.save(Booking(
            id = "bkg_${UUID.randomUUID()}",
            contact = contact,
            leadId = req.leadId,
            meetingType = req.meetingType,
            scheduledAt = req.scheduledAt,
            durationMins = req.durationMins,
            notes = req.notes,
        ))
        events.bookingCreated(booking)
        return booking.toDto()
    }

    @Transactional
    fun updateStatus(id: String, status: BookingStatus): BookingDto {
        val b = bookings.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        return bookings.save(b.copy(status = status)).toDto()
    }
}

// ── ReferralService ───────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class ReferralService(private val referrals: ReferralRepository, private val events: CrmEventPublisher) {

    fun listForReferrer(referrerId: String): List<ReferralDto> =
        referrals.findByReferrerId(referrerId).map { it.toDto() }

    @Transactional
    fun register(referrerId: String, req: RegisterReferralRequest): ReferralDto {
        val existing = referrals.findByReferredEmail(req.referredEmail)
        if (existing.isPresent) return existing.get().toDto()
        val ref = referrals.save(Referral(
            id = "ref_${UUID.randomUUID()}",
            referrerId = referrerId,
            referredEmail = req.referredEmail,
        ))
        events.referralRegistered(ref)
        return ref.toDto()
    }

    @Transactional
    fun markConverted(id: String): ReferralDto {
        val ref = referrals.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
        return referrals.save(ref.copy(converted = true, payoutAt = java.time.Instant.now())).toDto()
    }
}
