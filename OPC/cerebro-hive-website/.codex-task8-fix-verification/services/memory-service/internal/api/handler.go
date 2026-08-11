// Package api provides HTTP handlers for the memory-service.
package api

import (
	"net/http"
	"time"

	"github.com/cerebro/memory-service/internal/search"
	"github.com/cerebro/memory-service/internal/store"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

// Handler holds all store backends.
type Handler struct {
	working  *store.WorkingStore
	longterm *store.LongTermStore
	searcher *search.Searcher
}

// New creates a Handler with all memory backends.
func New(
	working *store.WorkingStore,
	longterm *store.LongTermStore,
	searcher *search.Searcher,
) *Handler {
	return &Handler{working: working, longterm: longterm, searcher: searcher}
}

// RegisterRoutes mounts all memory routes.
func (h *Handler) RegisterRoutes(r *gin.Engine) {
	r.GET("/health", h.health)
	v1 := r.Group("/api/v1")
	{
		v1.POST("/memory/store", h.store)
		v1.POST("/memory/search", h.search)
		v1.GET("/memory/:agentId", h.list)
		v1.DELETE("/memory/:agentId", h.deleteAll)
		v1.DELETE("/memory/:agentId/:key", h.deleteKey)
	}
}

func (h *Handler) health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "memory-service"})
}

// store godoc
//
//	@Summary	Store a memory entry
//	@Tags		memory
//	@Accept		json
//	@Produce	json
//	@Param		body	body		store.StoreRequest	true	"Memory entry"
//	@Success	201		{object}	map[string]string
//	@Router		/api/v1/memory/store [post]
func (h *Handler) store(c *gin.Context) {
	var req store.StoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	entry := store.MemoryEntry{
		ID:        uuid.New().String(),
		AgentID:   req.AgentID,
		RunID:     req.RunID,
		TaskID:    req.TaskID,
		Tier:      req.Tier,
		Key:       req.Key,
		Content:   req.Content,
		Metadata:  req.Metadata,
		CreatedAt: time.Now().UTC(),
	}
	if req.TTLSecs > 0 {
		exp := time.Now().UTC().Add(time.Duration(req.TTLSecs) * time.Second)
		entry.ExpiresAt = &exp
	}

	switch req.Tier {
	case store.TierWorking, store.TierExecution:
		if err := h.working.Set(c.Request.Context(), entry); err != nil {
			log.Error().Err(err).Msg("memory.store.working failed")
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case store.TierLongTerm, store.TierSemantic:
		if _, err := h.longterm.Upsert(c.Request.Context(), entry); err != nil {
			log.Error().Err(err).Msg("memory.store.longterm failed")
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "unknown tier: " + string(req.Tier)})
		return
	}

	log.Info().Str("tier", string(req.Tier)).Str("agent", req.AgentID).Str("key", req.Key).Msg("memory.stored")
	c.JSON(http.StatusCreated, gin.H{"id": entry.ID, "tier": entry.Tier})
}

// search godoc
//
//	@Summary	Search memory entries
//	@Tags		memory
//	@Accept		json
//	@Produce	json
//	@Param		body	body		store.SearchRequest		true	"Search criteria"
//	@Success	200		{array}		store.SearchResult
//	@Router		/api/v1/memory/search [post]
func (h *Handler) search(c *gin.Context) {
	var req store.SearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	results, err := h.searcher.Search(c.Request.Context(), req)
	if err != nil {
		log.Error().Err(err).Msg("memory.search failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if results == nil {
		results = []store.SearchResult{}
	}
	c.JSON(http.StatusOK, results)
}

// list godoc
//
//	@Summary	List all memory entries for an agent
//	@Tags		memory
//	@Produce	json
//	@Param		agentId	path	string	true	"Agent ID"
//	@Success	200		{array}	store.MemoryEntry
//	@Router		/api/v1/memory/{agentId} [get]
func (h *Handler) list(c *gin.Context) {
	agentID := c.Param("agentId")
	tier := store.MemoryTier(c.Query("tier"))

	var entries []store.MemoryEntry

	// Working tier entries
	if tier == "" || tier == store.TierWorking || tier == store.TierExecution {
		w, err := h.working.ListByAgent(c.Request.Context(), agentID)
		if err != nil {
			log.Error().Err(err).Msg("memory.list.working failed")
		} else {
			entries = append(entries, w...)
		}
	}

	// Long-term / semantic entries
	if tier == "" || tier == store.TierLongTerm || tier == store.TierSemantic {
		lt, err := h.longterm.ListByAgent(c.Request.Context(), agentID)
		if err != nil {
			log.Error().Err(err).Msg("memory.list.longterm failed")
		} else {
			entries = append(entries, lt...)
		}
	}

	if entries == nil {
		entries = []store.MemoryEntry{}
	}
	c.JSON(http.StatusOK, entries)
}

// deleteAll godoc
//
//	@Summary	Delete all memory for an agent
//	@Tags		memory
//	@Param		agentId	path	string	true	"Agent ID"
//	@Success	204
//	@Router		/api/v1/memory/{agentId} [delete]
func (h *Handler) deleteAll(c *gin.Context) {
	agentID := c.Param("agentId")
	ctx := c.Request.Context()

	if err := h.working.DeleteAll(ctx, agentID); err != nil {
		log.Error().Err(err).Msg("memory.deleteAll.working failed")
	}
	if err := h.longterm.DeleteAll(ctx, agentID); err != nil {
		log.Error().Err(err).Msg("memory.deleteAll.longterm failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Info().Str("agent", agentID).Msg("memory.deleteAll")
	c.Status(http.StatusNoContent)
}

// deleteKey godoc
//
//	@Summary	Delete a specific memory entry
//	@Tags		memory
//	@Param		agentId	path	string	true	"Agent ID"
//	@Param		key		path	string	true	"Memory key"
//	@Success	204
//	@Router		/api/v1/memory/{agentId}/{key} [delete]
func (h *Handler) deleteKey(c *gin.Context) {
	agentID := c.Param("agentId")
	key := c.Param("key")
	ctx := c.Request.Context()

	_ = h.working.Delete(ctx, agentID, key)
	if err := h.longterm.Delete(ctx, agentID, key); err != nil {
		log.Error().Err(err).Msg("memory.deleteKey.longterm failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
