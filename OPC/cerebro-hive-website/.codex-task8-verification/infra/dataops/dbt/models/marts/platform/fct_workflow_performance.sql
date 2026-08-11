-- ─────────────────────────────────────────────────────────────────────────────
-- DataOps / dbt — Workflow Performance Fact Table
-- Tracks execution time, success rates, and step-level breakdown.
-- ─────────────────────────────────────────────────────────────────────────────

{{
  config(
    materialized = 'incremental',
    unique_key   = 'execution_id',
    on_schema_change = 'sync_all_columns',
    tags         = ['platform', 'workflows']
  )
}}

WITH executions AS (
  SELECT
    id                                          AS execution_id,
    workflow_id,
    organization_id,
    user_id,
    status,
    started_at,
    completed_at,
    EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000 AS duration_ms,
    total_steps,
    completed_steps,
    failed_step,
    input_size_bytes,
    output_size_bytes,
    ai_calls_made,
    total_tokens_used,
    total_cost_usd,
    error_code,
    error_message,
    metadata
  FROM {{ source('raw_platform', 'workflow_executions') }}
  WHERE 1=1
  {% if is_incremental() %}
    AND started_at >= (
      SELECT COALESCE(MAX(started_at), '2024-01-01'::TIMESTAMPTZ) - INTERVAL '1 hour'
      FROM {{ this }}
    )
  {% endif %}
)

SELECT
  execution_id,
  workflow_id,
  organization_id,
  user_id,
  status,
  started_at,
  completed_at,
  DATE_TRUNC('hour', started_at)              AS started_hour,
  DATE_TRUNC('day',  started_at)              AS started_date,
  ROUND(duration_ms::NUMERIC, 2)             AS duration_ms,
  total_steps,
  completed_steps,
  ROUND((completed_steps::NUMERIC / NULLIF(total_steps, 0)) * 100, 2) AS completion_pct,
  failed_step,
  status = 'completed'                        AS is_successful,
  status = 'failed'                           AS is_failed,
  status = 'timeout'                          AS is_timeout,
  input_size_bytes,
  output_size_bytes,
  ai_calls_made,
  total_tokens_used,
  ROUND(total_cost_usd::NUMERIC, 6)           AS total_cost_usd,
  CASE
    WHEN duration_ms < 5000  THEN 'fast'
    WHEN duration_ms < 30000 THEN 'normal'
    WHEN duration_ms < 120000 THEN 'slow'
    ELSE 'very_slow'
  END                                          AS speed_tier,
  error_code,
  error_message,
  NOW()                                        AS dbt_updated_at
FROM executions
