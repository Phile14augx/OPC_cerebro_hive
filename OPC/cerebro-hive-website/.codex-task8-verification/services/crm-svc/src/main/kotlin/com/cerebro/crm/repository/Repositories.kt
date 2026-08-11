package com.cerebro.crm.repository

import com.cerebro.crm.entity.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ContactRepository : JpaRepository<Contact, String> {
    fun findByEmail(email: String): Optional<Contact>
    fun findByUserId(userId: String): Optional<Contact>
}

@Repository
interface LeadRepository : JpaRepository<Lead, String> {
    fun findByStatus(status: LeadStatus, pageable: Pageable): Page<Lead>
    fun findByContactId(contactId: String, pageable: Pageable): Page<Lead>
    fun findByAssignedTo(userId: String, pageable: Pageable): Page<Lead>

    @Query("SELECT l FROM Lead l ORDER BY l.score DESC, l.createdAt DESC")
    fun findAllByScoreDesc(pageable: Pageable): Page<Lead>
}

@Repository
interface BookingRepository : JpaRepository<Booking, String> {
    fun findByContactId(contactId: String, pageable: Pageable): Page<Booking>
    fun findByStatus(status: BookingStatus, pageable: Pageable): Page<Booking>
}

@Repository
interface ReferralRepository : JpaRepository<Referral, String> {
    fun findByReferrerId(referrerId: String): List<Referral>
    fun findByReferredEmail(email: String): Optional<Referral>
}
