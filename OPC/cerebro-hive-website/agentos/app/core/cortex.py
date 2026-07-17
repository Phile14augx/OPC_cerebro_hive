# NOTE: unused — an earlier pass guessed "Cortex" meant a live control-center
# stats aggregator and started building it here before discovering
# app/api/routers/cortex.py actually imports `app.core.cortex_engine`
# (forecast + knapsack-optimize). The real implementation lives there.
# This file is intentionally left inert rather than deleted (this workspace
# doesn't allow deleting files once written) so it doesn't get imported by
# mistake — nothing in the app imports `app.core.cortex`.
