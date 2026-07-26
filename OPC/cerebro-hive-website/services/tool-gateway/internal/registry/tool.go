// Package registry defines the tool registry for the HiveSwarm tool-gateway.
//
// Each Tool has a descriptor (name, description, JSON-schema input spec) and
// an executor backend that carries out the actual API call.
package registry

import (
	"fmt"
	"sync"
)

// ParamType constrains JSON-schema primitive types accepted in tool inputs.
type ParamType string

const (
	ParamString  ParamType = "string"
	ParamNumber  ParamType = "number"
	ParamBoolean ParamType = "boolean"
	ParamObject  ParamType = "object"
	ParamArray   ParamType = "array"
)

// ToolParam describes a single parameter in a tool's input schema.
type ToolParam struct {
	Name        string    `json:"name"`
	Type        ParamType `json:"type"`
	Description string    `json:"description"`
	Required    bool      `json:"required"`
	Enum        []string  `json:"enum,omitempty"`
}

// ToolCategory groups tools by domain.
type ToolCategory string

const (
	CategoryCode      ToolCategory = "code"
	CategorySearch    ToolCategory = "search"
	CategoryComms     ToolCategory = "comms"
	CategoryProject   ToolCategory = "project"
	CategoryCloud     ToolCategory = "cloud"
	CategoryData      ToolCategory = "data"
)

// ToolDefinition is the public descriptor returned by GET /tools.
type ToolDefinition struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Category    ToolCategory      `json:"category"`
	Params      []ToolParam       `json:"params"`
	RateLimit   RateLimitConfig   `json:"rateLimit"`
	RequiresAuth bool             `json:"requiresAuth"`
}

// RateLimitConfig defines per-tool rate limits.
type RateLimitConfig struct {
	RequestsPerMinute int `json:"requestsPerMinute"`
	BurstSize         int `json:"burstSize"`
}

// Registry holds all registered tool definitions and their executors.
type Registry struct {
	mu    sync.RWMutex
	tools map[string]ToolDefinition
}

// New creates an empty Registry and seeds it with built-in tools.
func New() *Registry {
	r := &Registry{tools: make(map[string]ToolDefinition)}
	r.seed()
	return r
}

// Get returns a tool definition by ID.
func (r *Registry) Get(id string) (ToolDefinition, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	t, ok := r.tools[id]
	return t, ok
}

// List returns all registered tool definitions.
func (r *Registry) List() []ToolDefinition {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]ToolDefinition, 0, len(r.tools))
	for _, t := range r.tools {
		out = append(out, t)
	}
	return out
}

// Register adds a new tool definition at runtime (e.g. from plugin discovery).
func (r *Registry) Register(t ToolDefinition) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if t.ID == "" {
		return fmt.Errorf("tool ID must not be empty")
	}
	r.tools[t.ID] = t
	return nil
}

// ── Built-in tool catalogue ────────────────────────────────────────────────────

func (r *Registry) seed() {
	tools := []ToolDefinition{
		{
			ID:          "github.search_code",
			Name:        "GitHub: Search Code",
			Description: "Search GitHub repositories for code matching a query.",
			Category:    CategoryCode,
			Params: []ToolParam{
				{Name: "query", Type: ParamString, Description: "Code search query", Required: true},
				{Name: "language", Type: ParamString, Description: "Filter by language (e.g. go, python)", Required: false},
				{Name: "per_page", Type: ParamNumber, Description: "Results per page (max 30)", Required: false},
			},
			RateLimit:    RateLimitConfig{RequestsPerMinute: 10, BurstSize: 5},
			RequiresAuth: true,
		},
		{
			ID:          "github.create_pr",
			Name:        "GitHub: Create Pull Request",
			Description: "Create a pull request in a GitHub repository.",
			Category:    CategoryCode,
			Params: []ToolParam{
				{Name: "owner", Type: ParamString, Description: "Repository owner", Required: true},
				{Name: "repo", Type: ParamString, Description: "Repository name", Required: true},
				{Name: "title", Type: ParamString, Description: "PR title", Required: true},
				{Name: "body", Type: ParamString, Description: "PR description (Markdown)", Required: false},
				{Name: "head", Type: ParamString, Description: "Head branch name", Required: true},
				{Name: "base", Type: ParamString, Description: "Base branch name", Required: true},
			},
			RateLimit:    RateLimitConfig{RequestsPerMinute: 5, BurstSize: 2},
			RequiresAuth: true,
		},
		{
			ID:          "slack.post_message",
			Name:        "Slack: Post Message",
			Description: "Post a message to a Slack channel.",
			Category:    CategoryComms,
			Params: []ToolParam{
				{Name: "channel", Type: ParamString, Description: "Channel ID or name", Required: true},
				{Name: "text", Type: ParamString, Description: "Message text (Markdown supported)", Required: true},
				{Name: "thread_ts", Type: ParamString, Description: "Reply to thread timestamp", Required: false},
			},
			RateLimit:    RateLimitConfig{RequestsPerMinute: 20, BurstSize: 5},
			RequiresAuth: true,
		},
		{
			ID:          "jira.create_issue",
			Name:        "Jira: Create Issue",
			Description: "Create a new Jira issue.",
			Category:    CategoryProject,
			Params: []ToolParam{
				{Name: "project_key", Type: ParamString, Description: "Jira project key (e.g. PROJ)", Required: true},
				{Name: "summary", Type: ParamString, Description: "Issue summary", Required: true},
				{Name: "description", Type: ParamString, Description: "Issue description (ADF or plain text)", Required: false},
				{Name: "issue_type", Type: ParamString, Description: "Issue type (Story, Bug, Task)", Required: false, Enum: []string{"Story", "Bug", "Task", "Epic"}},
				{Name: "priority", Type: ParamString, Description: "Priority level", Required: false, Enum: []string{"Highest", "High", "Medium", "Low", "Lowest"}},
			},
			RateLimit:    RateLimitConfig{RequestsPerMinute: 10, BurstSize: 3},
			RequiresAuth: true,
		},
		{
			ID:          "web.search",
			Name:        "Web Search",
			Description: "Search the web and return top results with snippets.",
			Category:    CategorySearch,
			Params: []ToolParam{
				{Name: "query", Type: ParamString, Description: "Search query", Required: true},
				{Name: "num_results", Type: ParamNumber, Description: "Number of results to return (max 10)", Required: false},
			},
			RateLimit:    RateLimitConfig{RequestsPerMinute: 30, BurstSize: 10},
			RequiresAuth: false,
		},
		{
			ID:          "code.execute",
			Name:        "Code Execution (Sandbox)",
			Description: "Execute Python, JavaScript, or Bash code in an isolated sandbox and return stdout/stderr.",
			Category:    CategoryCode,
			Params: []ToolParam{
				{Name: "language", Type: ParamString, Description: "Language to execute", Required: true, Enum: []string{"python", "javascript", "bash"}},
				{Name: "code", Type: ParamString, Description: "Source code to run", Required: true},
				{Name: "timeout_secs", Type: ParamNumber, Description: "Execution timeout in seconds (max 30)", Required: false},
			},
			RateLimit:    RateLimitConfig{RequestsPerMinute: 10, BurstSize: 3},
			RequiresAuth: false,
		},
		{
			ID:          "aws.describe_instances",
			Name:        "AWS: Describe EC2 Instances",
			Description: "List EC2 instances in a region with their state and tags.",
			Category:    CategoryCloud,
			Params: []ToolParam{
				{Name: "region", Type: ParamString, Description: "AWS region (e.g. us-east-1)", Required: true},
				{Name: "filters", Type: ParamArray, Description: "EC2 filter expressions", Required: false},
			},
			RateLimit:    RateLimitConfig{RequestsPerMinute: 5, BurstSize: 2},
			RequiresAuth: true,
		},
		{
			ID:          "k8s.get_pods",
			Name:        "Kubernetes: Get Pods",
			Description: "List pods in a namespace with their status.",
			Category:    CategoryCloud,
			Params: []ToolParam{
				{Name: "namespace", Type: ParamString, Description: "Kubernetes namespace", Required: true},
				{Name: "label_selector", Type: ParamString, Description: "Label selector (e.g. app=nginx)", Required: false},
			},
			RateLimit:    RateLimitConfig{RequestsPerMinute: 20, BurstSize: 5},
			RequiresAuth: true,
		},
	}

	for _, t := range tools {
		r.tools[t.ID] = t
	}
}
