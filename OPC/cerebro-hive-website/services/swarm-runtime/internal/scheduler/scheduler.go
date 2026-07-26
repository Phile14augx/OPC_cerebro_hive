// Package scheduler implements the HiveSwarm priority scheduler (HS-103).
//
// The scheduler maintains a min-heap of pending tasks ordered by composite
// priority score, which accounts for:
//   - Declared task priority (critical/high/normal/low/background)
//   - Time-in-queue penalty (tasks age up to prevent starvation)
//   - Resource availability (load factor of available agents)
//   - Deadline pressure (tasks approaching their deadline get bumped)
//   - Cost class (cost-aware scheduling can de-prioritize expensive tasks)
package scheduler

import (
	"container/heap"
	"context"
	"math"
	"sync"
	"time"

	"github.com/rs/zerolog/log"
)

// ── Priority weights ──────────────────────────────────────────────────────────

const (
	weightPriority    = 0.40
	weightDeadline    = 0.30
	weightAgeBonus    = 0.20
	weightCostPenalty = 0.10

	basePriorityCritical   = 1.0
	basePriorityHigh       = 0.75
	basePriorityNormal     = 0.50
	basePriorityLow        = 0.25
	basePriorityBackground = 0.10

	// Max time-in-queue before a task reaches maximum age bonus (5 min)
	maxAgeForBonus = 5 * time.Minute
)

// ── Task entry ────────────────────────────────────────────────────────────────

// ScheduledTask holds all scheduling metadata for a queued task.
type ScheduledTask struct {
	TaskID       string
	RunID        string
	Priority     string          // "critical" | "high" | "normal" | "low" | "background"
	Capability   string
	DeadlineAt   *time.Time
	MaxCostUsd   *float64
	EnqueuedAt   time.Time
	CompositeScore float64       // recomputed by the scheduler before each pop

	// index in the heap (required by heap.Interface)
	index int
}

// score computes the composite priority score (higher = dispatch first).
func (t *ScheduledTask) score(now time.Time) float64 {
	// 1. Base priority
	var base float64
	switch t.Priority {
	case "critical":
		base = basePriorityCritical
	case "high":
		base = basePriorityHigh
	case "low":
		base = basePriorityLow
	case "background":
		base = basePriorityBackground
	default:
		base = basePriorityNormal
	}

	// 2. Time-in-queue age bonus (linear ramp)
	age := now.Sub(t.EnqueuedAt)
	ageBonus := math.Min(1.0, float64(age)/float64(maxAgeForBonus))

	// 3. Deadline pressure (0 if no deadline; 1 if deadline < 30s away)
	deadlinePressure := 0.0
	if t.DeadlineAt != nil {
		remaining := t.DeadlineAt.Sub(now)
		if remaining <= 0 {
			deadlinePressure = 1.0
		} else if remaining < 30*time.Second {
			deadlinePressure = 1.0 - float64(remaining)/(float64(30*time.Second))
		}
	}

	// 4. Cost penalty (expensive tasks penalised slightly to prefer cheaper ones)
	costPenalty := 0.0
	if t.MaxCostUsd != nil && *t.MaxCostUsd > 1.0 {
		// Normalise: tasks > $10 receive max penalty
		costPenalty = math.Min(1.0, *t.MaxCostUsd/10.0) * 0.5
	}

	return weightPriority*base +
		weightDeadline*deadlinePressure +
		weightAgeBonus*ageBonus -
		weightCostPenalty*costPenalty
}

// ── Heap implementation ───────────────────────────────────────────────────────

type taskHeap []*ScheduledTask

func (h taskHeap) Len() int           { return len(h) }
func (h taskHeap) Less(i, j int) bool { return h[i].CompositeScore > h[j].CompositeScore } // max-heap
func (h taskHeap) Swap(i, j int) {
	h[i], h[j] = h[j], h[i]
	h[i].index = i
	h[j].index = j
}
func (h *taskHeap) Push(x any) {
	n := len(*h)
	item := x.(*ScheduledTask)
	item.index = n
	*h = append(*h, item)
}
func (h *taskHeap) Pop() any {
	old := *h
	n := len(old)
	item := old[n-1]
	old[n-1] = nil
	item.index = -1
	*h = old[:n-1]
	return item
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

// Scheduler is the HiveSwarm priority task scheduler.
type Scheduler struct {
	mu       sync.Mutex
	heap     taskHeap
	byID     map[string]*ScheduledTask
	dispatch chan *ScheduledTask // ready tasks are sent here
	stop     chan struct{}
}

// New creates and starts a new Scheduler.
func New() *Scheduler {
	s := &Scheduler{
		heap:     make(taskHeap, 0, 256),
		byID:     make(map[string]*ScheduledTask),
		dispatch: make(chan *ScheduledTask, 512),
		stop:     make(chan struct{}),
	}
	heap.Init(&s.heap)
	go s.rescoreLoop()
	return s
}

// Enqueue adds a task to the scheduler.
func (s *Scheduler) Enqueue(task *ScheduledTask) {
	task.EnqueuedAt = time.Now()
	task.CompositeScore = task.score(task.EnqueuedAt)
	s.mu.Lock()
	heap.Push(&s.heap, task)
	s.byID[task.TaskID] = task
	s.mu.Unlock()
	log.Debug().Str("taskId", task.TaskID).Float64("score", task.CompositeScore).Msg("task enqueued")
}

// Cancel removes a task from the scheduler. Returns false if not found.
func (s *Scheduler) Cancel(taskID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	task, ok := s.byID[taskID]
	if !ok {
		return false
	}
	// Mark with negative score so it floats to the bottom then remove
	task.CompositeScore = -math.MaxFloat64
	heap.Fix(&s.heap, task.index)
	heap.Pop(&s.heap)
	delete(s.byID, taskID)
	return true
}

// Ready returns the channel that receives tasks ready for dispatch.
func (s *Scheduler) Ready() <-chan *ScheduledTask {
	return s.dispatch
}

// Len returns the current queue depth.
func (s *Scheduler) Len() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.heap.Len()
}

// Stop shuts down the rescore loop.
func (s *Scheduler) Stop() {
	close(s.stop)
}

// rescoreLoop periodically rescores tasks (updates age bonus + deadline pressure)
// and dispatches the highest-priority task to the dispatch channel.
func (s *Scheduler) rescoreLoop() {
	ticker := time.NewTicker(250 * time.Millisecond)
	defer ticker.Stop()
	for {
		select {
		case <-s.stop:
			return
		case <-ticker.C:
			s.mu.Lock()
			now := time.Now()
			// Rescore all tasks
			for i, t := range s.heap {
				t.CompositeScore = t.score(now)
				_ = i
			}
			heap.Init(&s.heap) // re-heapify after bulk score update

			// Drain highest-priority tasks into dispatch channel
			for s.heap.Len() > 0 {
				top := s.heap[0]
				select {
				case s.dispatch <- top:
					heap.Pop(&s.heap)
					delete(s.byID, top.TaskID)
				default:
					// dispatch channel full — try again next tick
					goto done
				}
			}
		done:
			s.mu.Unlock()
		}
	}
}

// Run blocks and dispatches tasks to the provided handler function until ctx is done.
func (s *Scheduler) Run(ctx context.Context, handle func(ctx context.Context, task *ScheduledTask)) {
	for {
		select {
		case <-ctx.Done():
			return
		case task := <-s.dispatch:
			go handle(ctx, task)
		}
	}
}
