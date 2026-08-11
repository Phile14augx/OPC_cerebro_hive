package com.cerebro.crm.dto

import com.cerebro.crm.entity.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import java.math.BigDecimal
import java.time.Instant

// ── Contact ───────────────────────────────────────────────────────────────────

data class ContactDto(
    val id: String, val email: String, val firstName: String, val lastName: String,
    val company: String, val jobTitle: String, val industry: String,
    val companySize: String, val region: String, val phone: String?,
    val createdAt: Instant,
)

fun Contact.toDto() = ContactDto(
    id, email, firstName, lastName, company, jobTitle, industry, companySize, region, phone, createdAt,
)

// ── Lead ──────────────────────────────────────────────────────────────────────

data class SubmitLeadRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val firstName: String,
    @field:NotBlank val lastName: String,
    val company: String = "",
    val jobTitle: String = "",
    val industry: String = "",
    val companySize: String = "",
    val region: String = "",
    val phone: String? = null,
    val engagementType: EngagementType = EngagementType.general,
    val message: String = "",
    val productsInterested: List<String> = emptyList(),
    val source: String = "website",
)

data class LeadDto(
    val id: String, val contactId: String, val contactEmail: String,
    val contactName: String, val company: String,
    val status: LeadStatus, val engagementType: EngagementType,
    val message: String, val productsInterested: List<String>,
    val score: BigDecimal, val grade: String?,
    val source: String, val assignedTo: String?,
    val createdAt: Instant, val updatedAt: Instant,
)

fun Lead.toDto() = LeadDto(
    id, contact.id, contact.email,
    "${contact.firstName} ${contact.lastName}".trim(),
    contact.company,
    status, engagementType, message, productsInterested.toList(),
    score, grade, source, assignedTo, createdAt, updatedAt,
)

data class UpdateLeadStatusRequest(val status: LeadStatus, val note: String = "")

// ── Booking ───────────────────────────────────────────────────────────────────

data class CreateBookingRequest(
    @field:NotBlank val contactId: String,
    val leadId: String? = null,
    val meetingType: String = "discovery",
    val scheduledAt: Instant? = null,
    val durationMins: Short = 30,
    val notes: String = "",
)

data class BookingDto(
    val id: String, val contactId: String, val contactEmail: String,
    val leadId: String?, val status: BookingStatus,
    val meetingType: String, val scheduledAt: Instant?, val durationMins: Short,
    val notes: String, val createdAt: Instant,
)

fun Booking.toDto() = BookingDto(
    id, contact.id, contact.email, leadId, status,
    meetingType, scheduledAt, durationMins, notes, createdAt,
)

// ── Referral ──────────────────────────────────────────────────────────────────

data class RegisterReferralRequest(@field:Email @field:NotBlank val referredEmail: String)

data class ReferralDto(
    val id: String, val referrerId: String, val referredEmail: String,
    val converted: Boolean, val commissionPct: BigDecimal, val payoutAt: Instant?,
    val createdAt: Instant,
)

fun Referral.toDto() = ReferralDto(id, referrerId, referredEmail, converted, commissionPct, payoutAt, createdAt)
