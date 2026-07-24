-- ─────────────────────────────────────────────────────────────────────────────
-- DataOps / dbt — Daily AI Usage Fact Table
-- Aggregates token usage and cost by organization, model, and provider per day.
-- Materialized as a table; incrementally updated.
-- ─────────────────────────────────────────────────────────────────────────────

{{
  config(
    materialized  = 'incremental',
    unique_key    = ['usage_date', 'organization_id', 'provider', 'model'],
    on_schema_change = 'sync_all_columns',
    incremental_strategy = 'merge',
    tags          = ['ai', 'cost', 'daily']
  )
}}

WITH source AS (
  SELECT
    DATE_TRUNC('day', created_at)  AS usage_date,
    organization_id,
    provider,
    model,
    workflow_id,
    SUM(input_tokens)              AS total_input_tokens,
    SUM(output_tokens)             AS total_output_tokens,
    SUM(input_tokens + output_tokens) AS total_tokens,
    SUM(cost_usd)                  AS total_cost_usd,
    COUNT(*)                       AS request_count,
    COUNT(*) FILTER (WHERE cached = TRUE) AS cache_hits,
    AVG(duration_ms)               AS avg_duration_ms,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms) AS p50_duration_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95_duration_ms,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) AS p99_duration_ms,
    AVG(ttft_ms)                   AS avg_ttft_ms,
    COUNT(*) FILTER (WHERE error IS NOT NULL) AS error_count
  FROM {{ source('raw_platform', 'ai_usage_records') }}
  WHERE 1=1
  {% if is_incremental() %}
    AND created_at >= (
      SELECT COALESCE(MAX(usage_date), '2024-01-01'::DATE) - INTERVAL '2 days'
      FROM {{ this }}
    )
  {% endif %}
  GROUP BY 1, 2, 3, 4, 5
)

SELECT
  usage_date,
  organization_id,
  provider,
  model,
  workflow_id,
  total_input_tokens,
  total_output_tokens,
  total_tokens,
  ROUND(total_cost_usd::NUMERIC, 6)         AS total_cost_usd,
  request_count,
  cache_hits,
  ROUND((cache_hits::NUMERIC / NULLIF(request_count, 0)) * 100, 2) AS cache_hit_rate_pct,
  ROUND(avg_duration_ms::NUMERIC, 2)         AS avg_duration_ms,
  ROUND(p50_duration_ms::NUMERIC, 2)         AS p50_duration_ms,
  ROUND(p95_duration_ms::NUMERIC, 2)         AS p95_duration_ms,
  ROUND(p99_duration_ms::NUMERIC, 2)         AS p99_duration_ms,
  ROUND(avg_ttft_ms::NUMERIC, 2)             AS avg_ttft_ms,
  error_count,
  ROUND((error_count::NUMERIC / NULLIF(request_count, 0)) * 100, 4) AS error_rate_pct,
  ROUND(total_cost_usd::NUMERIC / NULLIF(request_count, 0), 6)      AS avg_cost_per_request_usd,
  NOW()                                      AS dbt_updated_at
FROM source
