package com.cerebro.crm.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.Instant

enum class LeadStatus { NEW, QUALIFIED, NURTURING, PROPOSAL, NEGOTIATION, WON, LOST, DISQUALIFIED }
enum class EngagementType { enterprise_ai, workforce_automation, data_analytics,
    security_compliance, digital_transform, ml_infrastructure, custom_ai, academy, general }
enum class BookingStatus { PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW }

@Entity @Table(name = "crm_contacts")
data class Contact(
    @Id val id: String = "",
    val userId: String? = null,
    val email: String = "",
    val firstName: String = "",
    val lastName: String = "",
    val company: String = "",
    val jobTitle: String = "",
    val industry: String = "",
    val companySize: String = "",
    val region: String = "",
    val phone: String? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
) { override fun equals(other: Any?) = other is Contact && id == other.id; override fun hashCode() = id.hashCode() }

@Entity @Table(name = "crm_leads")
data class Lead(
    @Id val id: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    val contact: Contact = Contact(),

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "lead_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    val status: LeadStatus = LeadStatus.NEW,

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "engagement_type")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    val engagementType: EngagementType = EngagementType.general,

    val message: String = "",

    @Column(columnDefinition = "text[]")
    val productsInterested: Array<String> = emptyArray(),

    val score: BigDecimal = BigDecimal.ZERO,
    val grade: String? = null,
    val source: String = "website",
    val assignedTo: String? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
) { override fun equals(other: Any?) = other is Lead && id == other.id; override fun hashCode() = id.hashCode() }

@Entity @Table(name = "crm_bookings")
data class Booking(
    @Id val id: String = "",
    val leadId: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    val contact: Contact = Contact(),

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "booking_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    val status: BookingStatus = BookingStatus.PENDING,

    val meetingType: String = "discovery",
    val scheduledAt: Instant? = null,
    val durationMins: Short = 30,
    val calendarEventId: String? = null,
    val notes: String = "",
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
) { override fun equals(other: Any?) = other is Booking && id == other.id; override fun hashCode() = id.hashCode() }

@Entity @Table(name = "crm_referrals")
data class Referral(
    @Id val id: String = "",
    val referrerId: String = "",
    val referredEmail: String = "",
    val referredLeadId: String? = null,
    val commissionPct: BigDecimal = BigDecimal("20.00"),
    val converted: Boolean = false,
    val payoutAt: Instant? = null,
    val createdAt: Instant = Instant.now(),
) { override fun equals(other: Any?) = other is Referral && id == other.id; override fun hashCode() = id.hashCode() }
