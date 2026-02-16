#!/usr/bin/env python3
"""Generate lightweight automation outputs for content + finance scaffolding.

This script is intentionally deterministic and dependency-free so it can run
inside GitHub Actions free tier.
"""

from __future__ import annotations

import csv
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = ROOT / "data" / "automation" / "catalog.json"
GENERATED_DIR = ROOT / "content" / "generated"
FINANCE_PATH = ROOT / "data" / "finance" / "weekly_report.csv"


def load_catalog() -> dict:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def write_blog_draft(catalog: dict) -> None:
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    capabilities = ", ".join(item["name"] for item in catalog["capabilities"][:3])
    draft = f"""# Weekly Automation Update: {catalog['business']}

## What shipped this week
- Automated pipeline expanded across: {capabilities}.
- New product template packs prepared for checkout publishing.
- Scheduled finance CSV generation remains active for executive review.

## Suggested CTA
Deploy one MVP product page, connect checkout links, then launch a 7-day outreach sprint.
"""
    (GENERATED_DIR / "weekly-blog-draft.md").write_text(draft, encoding="utf-8")


def write_social_posts(catalog: dict) -> None:
    lines = ["platform,post"]
    for idx, item in enumerate(catalog["capabilities"], start=1):
        lines.append(
            f"linkedin,Week {idx}: {item['name']} is live — {item['description']}"
        )
        lines.append(
            f"x,Auto-stack update: {item['name']} now outputs {item['output'][0]}"
        )
    (GENERATED_DIR / "social-posts.csv").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_finance_template() -> None:
    FINANCE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with FINANCE_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["week_start", "revenue", "refunds", "fees", "net_profit", "notes"])
        writer.writerow(
            [
                str(date.today()),
                0,
                0,
                0,
                0,
                "Auto-generated template row. Replace with payment export aggregates.",
            ]
        )


def main() -> None:
    catalog = load_catalog()
    write_blog_draft(catalog)
    write_social_posts(catalog)
    write_finance_template()
    print("Generated blog draft, social posts, and finance template.")


if __name__ == "__main__":
    main()
