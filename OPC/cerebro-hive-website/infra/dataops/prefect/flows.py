"""
DataOps — Prefect Orchestration Flows
Scheduled data pipeline flows for CerebroHive platform analytics.
Deploy: prefect deploy infra/dataops/prefect/flows.py --all
"""

from __future__ import annotations

import json
import os
import subprocess
from datetime import datetime, timedelta

from prefect import flow, get_run_logger, task
from prefect.schedules import CronSchedule

# ── Constants ─────────────────────────────────────────────────────────────────

DBT_PROJECT_DIR   = "infra/dataops/dbt"
DBT_PROFILES_DIR  = "infra/dataops/dbt"
SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "")


# ── Tasks ─────────────────────────────────────────────────────────────────────

@task(retries=3, retry_delay_seconds=60, name="Run dbt models")
def run_dbt(
    select: str = "",
    exclude: str = "",
    full_refresh: bool = False,
) -> dict:
    """Execute dbt run and return result summary."""
    logger = get_run_logger()

    cmd = [
        "dbt", "run",
        "--project-dir", DBT_PROJECT_DIR,
        "--profiles-dir", DBT_PROFILES_DIR,
        "--no-use-colors",
        "--log-format", "json",
    ]
    if select:      cmd += ["--select", select]
    if exclude:     cmd += ["--exclude", exclude]
    if full_refresh: cmd.append("--full-refresh")

    logger.info(f"Running dbt: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        logger.error(f"dbt run failed:\n{result.stderr}")
        raise RuntimeError(f"dbt run failed: {result.stderr[-500:]}")

    logger.info("dbt run complete")
    return {"stdout": result.stdout[-2000:], "returncode": result.returncode}


@task(retries=2, name="Run dbt tests")
def run_dbt_tests(select: str = "") -> dict:
    """Execute dbt test and return pass/fail counts."""
    logger = get_run_logger()

    cmd = [
        "dbt", "test",
        "--project-dir", DBT_PROJECT_DIR,
        "--profiles-dir", DBT_PROFILES_DIR,
        "--no-use-colors",
    ]
    if select: cmd += ["--select", select]

    result = subprocess.run(cmd, capture_output=True, text=True)
    output  = result.stdout + result.stderr

    # Parse counts from dbt output
    passed = output.count("PASS") + output.count("OK")
    failed = output.count("FAIL") + output.count("ERROR")

    logger.info(f"dbt tests: {passed} passed, {failed} failed")

    if failed > 0:
        raise RuntimeError(f"dbt tests failed: {failed} failures\n{output[-1000:]}")

    return {"passed": passed, "failed": failed}


@task(name="Check source freshness")
def check_source_freshness() -> dict:
    """Run dbt source freshness check."""
    logger = get_run_logger()
    cmd = [
        "dbt", "source", "freshness",
        "--project-dir", DBT_PROJECT_DIR,
        "--profiles-dir", DBT_PROFILES_DIR,
        "--output", "json",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        logger.warning(f"Source freshness issues detected:\n{result.stderr}")

    return {"output": result.stdout[-1000:], "returncode": result.returncode}


@task(name="Run Great Expectations validation")
def run_data_quality_checks(datasource: str, suite: str) -> dict:
    """Run a Great Expectations validation suite."""
    import importlib.util
    if importlib.util.find_spec("great_expectations") is None:
        return {"skipped": True, "reason": "great_expectations not installed"}

    import great_expectations as gx
    logger = get_run_logger()

    context   = gx.get_context(context_root_dir="infra/dataops/quality/gx")
    validator = context.get_validator(
        datasource_name=datasource,
        data_asset_name=suite,
    )
    results = validator.validate()
    success_rate = results.statistics["success_percent"]
    logger.info(f"GX validation '{suite}': {success_rate:.1f}% passed")

    if not results.success:
        raise RuntimeError(f"Data quality check failed for suite '{suite}': {success_rate:.1f}%")

    return {
        "suite":        suite,
        "success":      results.success,
        "success_rate": success_rate,
        "total":        results.statistics["evaluated_expectations"],
    }


@task(name="Notify Slack")
def notify_slack(message: str, color: str = "good") -> None:
    """Post a notification to the DataOps Slack channel."""
    if not SLACK_WEBHOOK_URL:
        return

    import urllib.request
    payload = json.dumps({
        "attachments": [{
            "color": color,
            "text":  message,
            "footer": "CerebroHive DataOps",
            "ts": int(datetime.utcnow().timestamp()),
        }]
    }).encode()

    req = urllib.request.Request(
        SLACK_WEBHOOK_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    urllib.request.urlopen(req, timeout=5)


# ── Flows ─────────────────────────────────────────────────────────────────────

@flow(
    name="AI Usage Analytics Pipeline",
    description="Incrementally refreshes AI cost and usage analytics models",
    log_prints=True,
)
def ai_usage_pipeline(full_refresh: bool = False) -> None:
    """Daily incremental pipeline for AI usage marts."""
    logger = get_run_logger()
    logger.info("Starting AI usage pipeline")

    try:
        check_source_freshness()
        run_dbt(select="tag:ai tag:cost", full_refresh=full_refresh)
        run_dbt_tests(select="tag:ai")
        run_data_quality_checks(
            datasource="cerebro_hive_postgres",
            suite="ai_usage_suite",
        )
        notify_slack(f"✅ AI usage pipeline complete at {datetime.utcnow().isoformat()}")
    except Exception as e:
        notify_slack(f"❌ AI usage pipeline FAILED: {e}", color="danger")
        raise


@flow(
    name="Platform Performance Pipeline",
    description="Refreshes workflow and platform performance analytics",
    log_prints=True,
)
def platform_performance_pipeline() -> None:
    """Hourly pipeline for near-realtime platform analytics."""
    logger = get_run_logger()
    logger.info("Starting platform performance pipeline")

    try:
        run_dbt(select="tag:platform", full_refresh=False)
        run_dbt_tests(select="tag:platform")
        notify_slack(f"✅ Platform pipeline complete at {datetime.utcnow().isoformat()}")
    except Exception as e:
        notify_slack(f"❌ Platform pipeline FAILED: {e}", color="danger")
        raise


@flow(
    name="Compliance Audit Pipeline",
    description="Generates compliance audit trails and GDPR reports",
    log_prints=True,
)
def compliance_pipeline() -> None:
    """Monthly compliance pipeline — runs SOC2 + GDPR reporting models."""
    logger = get_run_logger()
    logger.info("Starting compliance pipeline")

    try:
        run_dbt(select="tag:compliance tag:audit", full_refresh=False)
        run_dbt_tests(select="tag:compliance")
        notify_slack(f"✅ Compliance pipeline complete at {datetime.utcnow().isoformat()}")
    except Exception as e:
        notify_slack(f"❌ Compliance pipeline FAILED: {e}", color="danger")
        raise


@flow(
    name="Full Refresh Weekly",
    description="Full-refresh of all analytics models — runs every Sunday 1 AM UTC",
    log_prints=True,
)
def weekly_full_refresh() -> None:
    """Full refresh of all models to correct any incremental drift."""
    logger = get_run_logger()
    logger.info("Starting weekly full refresh")

    try:
        run_dbt(full_refresh=True)
        run_dbt_tests()
        notify_slack("✅ Weekly full refresh complete")
    except Exception as e:
        notify_slack(f"❌ Weekly full refresh FAILED: {e}", color="danger")
        raise


# ── Deployment schedules ──────────────────────────────────────────────────────
# These are referenced by prefect.yaml deployments

DEPLOYMENTS = [
    {
        "flow":     ai_usage_pipeline,
        "name":     "ai-usage-daily",
        "schedule": CronSchedule(cron="0 1 * * *", timezone="UTC"),  # 1 AM UTC daily
    },
    {
        "flow":     platform_performance_pipeline,
        "name":     "platform-performance-hourly",
        "schedule": CronSchedule(cron="0 * * * *", timezone="UTC"),  # every hour
    },
    {
        "flow":     compliance_pipeline,
        "name":     "compliance-monthly",
        "schedule": CronSchedule(cron="0 2 1 * *", timezone="UTC"),  # 2 AM UTC 1st of month
    },
    {
        "flow":     weekly_full_refresh,
        "name":     "full-refresh-weekly",
        "schedule": CronSchedule(cron="0 1 * * 0", timezone="UTC"),  # 1 AM UTC Sunday
    },
]


if __name__ == "__main__":
    # Local test run
    ai_usage_pipeline()
