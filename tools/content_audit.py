#!/usr/bin/env python3
"""Audit Dungeoneers content files for structural and cross-reference issues."""

from __future__ import annotations

import csv
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]

ACTUAL_DATA_FILES = [
    "classes/classes.csv",
    "spells/spells.csv",
    "monsters/monsters.csv",
    "equipment/items.csv",
    "armors/armors.csv",
    "armors/armors_database_formatted.csv",
    "skills/skills.csv",
    "skills/skill_aliases.csv",
    "backgrounds/backgrounds.csv",
    "campaigns/campaigns.csv",
    "npcs/npcs.csv",
    "quests/quests.csv",
    "factions/factions.csv",
    "encounters/encounters.csv",
    "locations/locations.csv",
    "weapons/weapons.csv",
    "magic_items/magic_items.csv",
    "treasure/treasure.csv",
    "character_sheets/character_sheets.csv",
]

TEMPLATE_ONLY_FILES = [
    "character_sheets/character_sheets_template.csv",
    "encounters/encounters_template.csv",
    "feats/feats_template.csv",
    "jobs/jobs_template.csv",
    "locations/locations_template.csv",
    "magic_items/magic_items_template.csv",
    "miscellaneous_objects/miscellaneous_objects_template.csv",
    "races/races_template.csv",
    "treasure/treasure_template.csv",
    "weapons/weapons_template.csv",
]

DEFAULT_DB_FIELDS = {"id", "name", "version", "is_active"}
REQUIRED_DB_FIELDS_BY_FILE = {
    "skills/skill_aliases.csv": {"alias", "skill_id", "source", "confidence", "notes"},
    "armors/armors.csv": {"name", "type", "rarity", "cr_bonus", "cost"},
}
GENERIC_FANTASY_KEYWORDS = {
    "dragon",
    "dwarf",
    "elf",
    "goblin",
    "healing potion",
    "longsword",
    "skeleton",
    "wizard tower",
}
NUMERIC_COLUMNS = {
    "campaigns/campaigns.csv": ("session_count", "current_level"),
    "npcs/npcs.csv": ("level", "trust", "access", "leverage", "heat", "influence_threshold"),
    "factions/factions.csv": (
        "resource_cashflow",
        "resource_clout",
        "resource_morale",
        "resource_territory",
    ),
    "locations/locations.csv": ("rest_quality", "wifi_quality"),
}
DECIMAL_COLUMNS = {
    "monsters/monsters.csv": ("challenge_rating",),
}


@dataclass
class Issue:
    severity: str
    location: str
    message: str


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def read_csv_rows(path: Path) -> list[list[str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.reader(handle))


def read_csv_dicts(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def load_index(path: str, key: str = "id") -> dict[str, dict[str, str]]:
    rows = read_csv_dicts(ROOT / path)
    return {row[key]: row for row in rows if row.get(key)}


def split_refs(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(";") if part.strip()]


def format_issues(issues: Iterable[Issue]) -> str:
    grouped: dict[str, list[Issue]] = defaultdict(list)
    for issue in issues:
        grouped[issue.severity].append(issue)

    lines = []
    for severity in ("ERROR", "WARN", "INFO"):
        entries = grouped.get(severity, [])
        if not entries:
            continue
        lines.append(f"{severity} ({len(entries)})")
        for entry in entries:
            lines.append(f"- {entry.location}: {entry.message}")
        lines.append("")
    return "\n".join(lines).rstrip()


def audit_csv_shape(path: Path) -> list[Issue]:
    issues: list[Issue] = []
    if not path.exists():
        return [Issue("ERROR", rel(path), "file is missing")]

    rows = read_csv_rows(path)
    if not rows:
        return [Issue("ERROR", rel(path), "file is empty")]

    header = rows[0]
    for index, row in enumerate(rows[1:], start=2):
        if not row or all(not cell.strip() for cell in row):
            continue
        if row[0].startswith("#"):
            issues.append(Issue("WARN", f"{rel(path)}:{index}", "comment row inside CSV data"))
            continue
        if len(row) != len(header):
            issues.append(
                Issue(
                    "ERROR",
                    f"{rel(path)}:{index}",
                    f"row has {len(row)} columns; expected {len(header)}",
                )
            )
    return issues


def audit_db_fields(path: Path) -> list[Issue]:
    rows = read_csv_rows(path)
    if not rows:
        return []
    header = set(rows[0])
    required_fields = REQUIRED_DB_FIELDS_BY_FILE.get(rel(path), DEFAULT_DB_FIELDS)
    missing = sorted(required_fields - header)
    if not missing:
        return []
    return [Issue("INFO", rel(path), "missing database-ready fields: " + ", ".join(missing))]


def audit_duplicate_ids(path: Path) -> list[Issue]:
    if not path.exists():
        return []
    rows = read_csv_dicts(path)
    ids = [row.get("id", "").strip() for row in rows if row.get("id", "").strip()]
    duplicates = sorted(item for item, count in Counter(ids).items() if count > 1)
    return [Issue("ERROR", rel(path), f"duplicate ids found: {', '.join(duplicates)}")] if duplicates else []


def audit_numeric_columns(path: Path, column_names: tuple[str, ...], allow_decimal: bool = False) -> list[Issue]:
    issues: list[Issue] = []
    pattern = r"\d+(?:\.\d+)?" if allow_decimal else r"\d+"
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for index, row in enumerate(reader, start=2):
            for column in column_names:
                value = (row.get(column) or "").strip()
                if value and not re.fullmatch(pattern, value):
                    issues.append(
                        Issue(
                            "ERROR",
                            f"{rel(path)}:{index}",
                            f"column {column!r} should be numeric but is {value!r}",
                        )
                    )
    return issues


def audit_reference_field(
    path: str,
    field_name: str,
    valid_refs: set[str],
    *,
    separator: str = ";",
    severity: str = "ERROR",
    allow_blank: bool = True,
) -> list[Issue]:
    issues: list[Issue] = []
    rows = read_csv_dicts(ROOT / path)
    for index, row in enumerate(rows, start=2):
        raw_value = (row.get(field_name) or "").strip()
        if not raw_value:
            if not allow_blank:
                record = row.get("id") or row.get("name") or "unknown record"
                issues.append(
                    Issue(severity, f"{path}:{index}", f"field {field_name!r} is blank for {record}")
                )
            continue
        if separator:
            refs = split_refs(raw_value)
        else:
            refs = [raw_value]
        for ref in refs:
            if ref not in valid_refs:
                issues.append(
                    Issue(
                        severity,
                        f"{path}:{index}",
                        f"field {field_name!r} references unknown id {ref!r}",
                    )
                )
    return issues


def audit_background_references(
    class_names: set[str], class_ids: set[str], skill_ids: set[str]
) -> list[Issue]:
    issues: list[Issue] = []
    path = ROOT / "backgrounds/backgrounds.csv"

    with path.open(newline="", encoding="utf-8") as handle:
        for index, row in enumerate(csv.DictReader(handle), start=2):
            restriction = (row.get("class_restriction") or "").strip()
            if restriction and restriction != "Any" and restriction not in class_names:
                issues.append(
                    Issue(
                        "ERROR",
                        f"{rel(path)}:{index}",
                        f"class restriction {restriction!r} does not exist in classes/classes.csv",
                    )
                )

            class_id = (row.get("class_id") or "").strip()
            if restriction and restriction != "Any" and not class_id:
                issues.append(
                    Issue(
                        "WARN",
                        f"{rel(path)}:{index}",
                        "class-restricted background is missing class_id",
                    )
                )
            if class_id and class_id not in class_ids:
                issues.append(
                    Issue(
                        "ERROR",
                        f"{rel(path)}:{index}",
                        f"class_id {class_id!r} does not exist in classes/classes.csv",
                    )
                )

            for skill_id in split_refs(row.get("skill_ids")):
                if skill_id not in skill_ids:
                    issues.append(
                        Issue(
                            "ERROR",
                            f"{rel(path)}:{index}",
                            f"skill_id {skill_id!r} does not exist in skills/skills.csv",
                        )
                    )
    return issues


def audit_npc_references(class_names: set[str], class_ids: set[str]) -> list[Issue]:
    issues: list[Issue] = []
    path = ROOT / "npcs/npcs.csv"

    with path.open(newline="", encoding="utf-8") as handle:
        for index, row in enumerate(csv.DictReader(handle), start=2):
            class_name = (row.get("class") or "").strip()
            class_id = (row.get("class_id") or "").strip()

            if class_name and class_name not in class_names:
                issues.append(
                    Issue(
                        "WARN",
                        f"{rel(path)}:{index}",
                        f"NPC class {class_name!r} is not defined in classes/classes.csv",
                    )
                )
            if class_id and class_id not in class_ids:
                issues.append(
                    Issue(
                        "ERROR",
                        f"{rel(path)}:{index}",
                        f"class_id {class_id!r} does not exist in classes/classes.csv",
                    )
                )
            if (row.get("location") or "").strip() and not (row.get("location_id") or "").strip():
                issues.append(
                    Issue(
                        "WARN",
                        f"{rel(path)}:{index}",
                        "NPC has location text but no location_id",
                    )
                )
    return issues


def audit_quest_givers(npc_ids: set[str]) -> list[Issue]:
    issues: list[Issue] = []
    path = ROOT / "quests/quests.csv"
    with path.open(newline="", encoding="utf-8") as handle:
        for index, row in enumerate(csv.DictReader(handle), start=2):
            giver_id = (row.get("quest_giver_npc_id") or "").strip()
            giver_text = (row.get("quest_giver_text") or "").strip()
            if giver_id and giver_id not in npc_ids:
                issues.append(
                    Issue(
                        "ERROR",
                        f"{rel(path)}:{index}",
                        f"quest_giver_npc_id {giver_id!r} is not present in npcs/npcs.csv",
                    )
                )
            if giver_text and not giver_id and giver_text.lower() != "you":
                issues.append(
                    Issue(
                        "WARN",
                        f"{rel(path)}:{index}",
                        f"quest has quest_giver_text {giver_text!r} without quest_giver_npc_id",
                    )
                )
    return issues


def audit_template_coverage() -> list[Issue]:
    issues: list[Issue] = []
    for template_rel in TEMPLATE_ONLY_FILES:
        template_path = ROOT / template_rel
        actual_rel = template_rel.replace("_template", "")
        actual_path = ROOT / actual_rel
        if not actual_path.exists():
            issues.append(
                Issue(
                    "WARN",
                    template_rel,
                    f"template exists without matching data file {actual_rel}",
                )
            )
        if not template_path.exists():
            issues.append(Issue("WARN", template_rel, "template file is missing"))
            continue
        rows = read_csv_rows(template_path)
        sample_text = " ".join(",".join(row) for row in rows[1:4]).lower()
        if any(_contains_keyword(sample_text, keyword) for keyword in GENERIC_FANTASY_KEYWORDS):
            issues.append(
                Issue(
                    "INFO",
                    template_rel,
                    "template still uses generic fantasy sample content instead of Digital Nomadia content",
                )
            )
    return issues


def _contains_keyword(sample_text: str, keyword: str) -> bool:
    if " " in keyword:
        return keyword in sample_text
    return re.search(rf"\b{re.escape(keyword)}\b", sample_text) is not None


def main() -> int:
    issues: list[Issue] = []

    for rel_path in ACTUAL_DATA_FILES:
        path = ROOT / rel_path
        issues.extend(audit_csv_shape(path))
        issues.extend(audit_db_fields(path))
        issues.extend(audit_duplicate_ids(path))

        numeric_columns = NUMERIC_COLUMNS.get(rel_path)
        if numeric_columns:
            issues.extend(audit_numeric_columns(path, numeric_columns))

        decimal_columns = DECIMAL_COLUMNS.get(rel_path)
        if decimal_columns:
            issues.extend(audit_numeric_columns(path, decimal_columns, allow_decimal=True))

    class_rows = load_index("classes/classes.csv")
    skill_rows = load_index("skills/skills.csv")
    faction_rows = load_index("factions/factions.csv")
    npc_rows = load_index("npcs/npcs.csv")
    quest_rows = load_index("quests/quests.csv")
    encounter_rows = load_index("encounters/encounters.csv")
    location_rows = load_index("locations/locations.csv")
    monster_rows = load_index("monsters/monsters.csv")
    campaign_rows = load_index("campaigns/campaigns.csv")

    class_ids = set(class_rows)
    class_names = {row["name"] for row in class_rows.values()}
    skill_ids = set(skill_rows)
    faction_ids = set(faction_rows)
    npc_ids = set(npc_rows)
    quest_ids = set(quest_rows)
    encounter_ids = set(encounter_rows)
    location_ids = set(location_rows)
    monster_ids = set(monster_rows)
    campaign_ids = set(campaign_rows)

    issues.extend(audit_background_references(class_names, class_ids, skill_ids))
    issues.extend(audit_npc_references(class_names, class_ids))
    issues.extend(audit_quest_givers(npc_ids))

    issues.extend(audit_reference_field("skills/skill_aliases.csv", "skill_id", skill_ids))
    issues.extend(audit_reference_field("npcs/npcs.csv", "primary_faction_id", faction_ids))
    issues.extend(audit_reference_field("npcs/npcs.csv", "secondary_faction_ids", faction_ids))
    issues.extend(audit_reference_field("npcs/npcs.csv", "location_id", location_ids))
    issues.extend(audit_reference_field("quests/quests.csv", "quest_giver_npc_id", npc_ids))
    issues.extend(audit_reference_field("quests/quests.csv", "sponsoring_faction_id", faction_ids))
    issues.extend(audit_reference_field("quests/quests.csv", "opposition_faction_ids", faction_ids))
    issues.extend(audit_reference_field("quests/quests.csv", "location_id", location_ids))
    issues.extend(audit_reference_field("quests/quests.csv", "linked_encounter_ids", encounter_ids))
    issues.extend(audit_reference_field("quests/quests.csv", "campaign_id", campaign_ids))
    issues.extend(audit_reference_field("factions/factions.csv", "leader_npc_ids", npc_ids))
    issues.extend(audit_reference_field("factions/factions.csv", "rival_faction_ids", faction_ids))
    issues.extend(audit_reference_field("encounters/encounters.csv", "location_id", location_ids))
    issues.extend(audit_reference_field("encounters/encounters.csv", "enemy_ids", monster_ids))
    issues.extend(audit_reference_field("campaigns/campaigns.csv", "primary_faction_ids", faction_ids))
    issues.extend(audit_reference_field("campaigns/campaigns.csv", "opposition_faction_ids", faction_ids))
    issues.extend(audit_reference_field("campaigns/campaigns.csv", "featured_npc_ids", npc_ids))
    issues.extend(audit_reference_field("campaigns/campaigns.csv", "featured_quest_ids", quest_ids))
    issues.extend(audit_reference_field("campaigns/campaigns.csv", "featured_location_ids", location_ids))
    issues.extend(audit_reference_field("campaigns/campaigns.csv", "featured_encounter_ids", encounter_ids))

    issues.extend(audit_template_coverage())

    print(f"Content Audit: {ROOT.name}")
    print()
    if issues:
        print(format_issues(issues))
    else:
        print("No issues found.")

    return 1 if any(issue.severity == "ERROR" for issue in issues) else 0


if __name__ == "__main__":
    sys.exit(main())
