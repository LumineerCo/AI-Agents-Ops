#!/usr/bin/env python3
"""Hourly company-cycle artifact generator for GitHub Actions.

Creates a simple JSON status report under backend/reports/latest.json from backend data.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "backend" / "data"
REPORTS = ROOT / "backend" / "reports"


def read_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def main() -> None:
    clients = read_json(DATA / "clients.json", [])
    tasks = read_json(DATA / "tasks.json", [])
    finance = read_json(
        DATA / "finance.json",
        {"monthly_revenue": 0, "monthly_refunds": 0, "transaction_fees": 0, "net_profit": 0, "last_cycle": "not-run"},
    )

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "clients_total": len(clients),
        "tasks_total": len(tasks),
        "running_tasks": len([t for t in tasks if t.get("status") == "running"]),
        "queued_tasks": len([t for t in tasks if t.get("status") == "queued"]),
        "finance": finance,
        "next_action": "Review top-performing offer and publish one new landing page variant.",
    }

    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "latest.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    finance["last_cycle"] = report["generated_at"]
    (DATA / "finance.json").write_text(json.dumps(finance, indent=2), encoding="utf-8")

    print("Generated backend/reports/latest.json")


if __name__ == "__main__":
    main()
