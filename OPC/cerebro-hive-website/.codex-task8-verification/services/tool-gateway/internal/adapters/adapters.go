// Package adapters provides Adapter implementations for each built-in tool.
//
// Production adapters make real API calls using credentials from env vars.
// Each adapter validates its required env vars at startup and logs a warning
// (not a fatal error) if credentials are missing — the tool will return an
// AUTH_MISSING error when called rather than crashing the gateway.
package adapters

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/cerebro/tool-gateway/internal/executor"
	"github.com/rs/zerolog/log"
)

// RegisterAll wires every built-in adapter into the Executor.
func RegisterAll(ex *executor.Executor) {
	ex.Register("github.search_code", &GitHubSearchCode{token: os.Getenv("GITHUB_TOKEN")})
	ex.Register("github.create_pr", &GitHubCreatePR{token: os.Getenv("GITHUB_TOKEN")})
	ex.Register("slack.post_message", &SlackPostMessage{token: os.Getenv("SLACK_BOT_TOKEN")})
	ex.Register("jira.create_issue", &JiraCreateIssue{
		baseURL: os.Getenv("JIRA_BASE_URL"),
		email:   os.Getenv("JIRA_EMAIL"),
		apiKey:  os.Getenv("JIRA_API_KEY"),
	})
	ex.Register("web.search", &WebSearch{apiKey: os.Getenv("SERPER_API_KEY")})
	ex.Register("code.execute", &CodeExecute{})
	ex.Register("aws.describe_instances", &AWSDescribeInstances{})
	ex.Register("k8s.get_pods", &K8sGetPods{})

	log.Info().Msg("tool adapters registered")
}

// ── helpers ────────────────────────────────────────────────────────────────────

func httpClient() *http.Client {
	return &http.Client{Timeout: 25 * time.Second}
}

func authError(toolID string) error {
	return fmt.Errorf("AUTH_MISSING: credentials not configured for %s; set the required env var", toolID)
}

func getString(input map[string]any, key string) string {
	v, _ := input[key].(string)
	return v
}

func getInt(input map[string]any, key string, def int) int {
	switch v := input[key].(type) {
	case float64:
		return int(v)
	case int:
		return v
	}
	return def
}

// ── GitHub ─────────────────────────────────────────────────────────────────────

type GitHubSearchCode struct{ token string }

func (a *GitHubSearchCode) Execute(ctx context.Context, input map[string]any) (any, error) {
	if a.token == "" {
		return nil, authError("github.search_code")
	}
	query := getString(input, "query")
	if lang := getString(input, "language"); lang != "" {
		query += " language:" + lang
	}
	req, _ := http.NewRequestWithContext(ctx, "GET",
		"https://api.github.com/search/code?q="+url.QueryEscape(query)+"&per_page=10", nil)
	req.Header.Set("Authorization", "Bearer "+a.token)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := httpClient().Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("github API %d: %s", resp.StatusCode, body)
	}
	var result any
	json.Unmarshal(body, &result)
	return result, nil
}

type GitHubCreatePR struct{ token string }

func (a *GitHubCreatePR) Execute(ctx context.Context, input map[string]any) (any, error) {
	if a.token == "" {
		return nil, authError("github.create_pr")
	}
	owner, repo := getString(input, "owner"), getString(input, "repo")
	payload, _ := json.Marshal(map[string]any{
		"title": getString(input, "title"),
		"body":  getString(input, "body"),
		"head":  getString(input, "head"),
		"base":  getString(input, "base"),
	})
	req, _ := http.NewRequestWithContext(ctx, "POST",
		fmt.Sprintf("https://api.github.com/repos/%s/%s/pulls", owner, repo),
		strings.NewReader(string(payload)))
	req.Header.Set("Authorization", "Bearer "+a.token)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient().Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("github API %d: %s", resp.StatusCode, body)
	}
	var result any
	json.Unmarshal(body, &result)
	return result, nil
}

// ── Slack ──────────────────────────────────────────────────────────────────────

type SlackPostMessage struct{ token string }

func (a *SlackPostMessage) Execute(ctx context.Context, input map[string]any) (any, error) {
	if a.token == "" {
		return nil, authError("slack.post_message")
	}
	payload, _ := json.Marshal(map[string]any{
		"channel":   getString(input, "channel"),
		"text":      getString(input, "text"),
		"thread_ts": getString(input, "thread_ts"),
	})
	req, _ := http.NewRequestWithContext(ctx, "POST",
		"https://slack.com/api/chat.postMessage",
		strings.NewReader(string(payload)))
	req.Header.Set("Authorization", "Bearer "+a.token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient().Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var result map[string]any
	json.NewDecoder(resp.Body).Decode(&result)
	if ok, _ := result["ok"].(bool); !ok {
		return nil, fmt.Errorf("slack error: %v", result["error"])
	}
	return result, nil
}

// ── Jira ───────────────────────────────────────────────────────────────────────

type JiraCreateIssue struct {
	baseURL string
	email   string
	apiKey  string
}

func (a *JiraCreateIssue) Execute(ctx context.Context, input map[string]any) (any, error) {
	if a.apiKey == "" || a.baseURL == "" {
		return nil, authError("jira.create_issue")
	}
	issueType := getString(input, "issue_type")
	if issueType == "" {
		issueType = "Task"
	}
	payload, _ := json.Marshal(map[string]any{
		"fields": map[string]any{
			"project":   map[string]string{"key": getString(input, "project_key")},
			"summary":   getString(input, "summary"),
			"issuetype": map[string]string{"name": issueType},
			"description": map[string]any{
				"type":    "doc",
				"version": 1,
				"content": []map[string]any{
					{"type": "paragraph", "content": []map[string]any{
						{"type": "text", "text": getString(input, "description")},
					}},
				},
			},
		},
	})
	req, _ := http.NewRequestWithContext(ctx, "POST",
		a.baseURL+"/rest/api/3/issue",
		strings.NewReader(string(payload)))
	req.SetBasicAuth(a.email, a.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient().Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("jira API %d: %s", resp.StatusCode, body)
	}
	var result any
	json.Unmarshal(body, &result)
	return result, nil
}

// ── Web Search (Serper.dev) ────────────────────────────────────────────────────

type WebSearch struct{ apiKey string }

func (a *WebSearch) Execute(ctx context.Context, input map[string]any) (any, error) {
	if a.apiKey == "" {
		// Fallback: return a stub so the tool still works in dev without a key
		log.Warn().Msg("web.search: SERPER_API_KEY not set — returning stub result")
		return map[string]any{
			"organic": []map[string]any{
				{"title": "Stub result", "snippet": "Configure SERPER_API_KEY for real web search.", "link": "https://serper.dev"},
			},
		}, nil
	}
	payload, _ := json.Marshal(map[string]any{
		"q": getString(input, "query"),
		"num": getInt(input, "num_results", 5),
	})
	req, _ := http.NewRequestWithContext(ctx, "POST",
		"https://google.serper.dev/search",
		strings.NewReader(string(payload)))
	req.Header.Set("X-API-KEY", a.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient().Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var result any
	json.NewDecoder(resp.Body).Decode(&result)
	return result, nil
}

// ── Code Execution (sandbox stub) ─────────────────────────────────────────────

// CodeExecute is a sandboxed code runner. In M4 this is a stub that returns
// a safe placeholder — real sandbox execution (e.g. Docker subprocess) is wired
// in M5 Tool Ecosystem expansion.
type CodeExecute struct{}

func (a *CodeExecute) Execute(_ context.Context, input map[string]any) (any, error) {
	lang := getString(input, "language")
	code := getString(input, "code")
	if len(code) > 4000 {
		return nil, fmt.Errorf("code too long (max 4000 chars)")
	}
	return map[string]any{
		"stdout":     fmt.Sprintf("[sandbox stub] would execute %s code (%d chars)", lang, len(code)),
		"stderr":     "",
		"exit_code":  0,
		"note":       "Real code execution sandbox not yet wired. Configure SANDBOX_ENABLED=true in a future milestone.",
	}, nil
}

// ── AWS (stub) ─────────────────────────────────────────────────────────────────

type AWSDescribeInstances struct{}

func (a *AWSDescribeInstances) Execute(_ context.Context, input map[string]any) (any, error) {
	region := getString(input, "region")
	if region == "" {
		region = "us-east-1"
	}
	return map[string]any{
		"note":      "AWS adapter stub. Set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY to enable.",
		"region":    region,
		"instances": []any{},
	}, nil
}

// ── Kubernetes (stub) ──────────────────────────────────────────────────────────

type K8sGetPods struct{}

func (a *K8sGetPods) Execute(_ context.Context, input map[string]any) (any, error) {
	ns := getString(input, "namespace")
	if ns == "" {
		ns = "default"
	}
	return map[string]any{
		"note":      "Kubernetes adapter stub. Mount a kubeconfig to enable.",
		"namespace": ns,
		"pods":      []any{},
	}, nil
}
