from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path


SOURCE_SYSTEM = "UKZUZ_OOS_CIS01D"
SOURCE_LABEL = "ÚKZÚZ OOS_CIS01D"

INPUT_CSV = Path("CiselnikDruhu.csv")
OUTPUT_SQL = Path("scripts/catalog/generated-ukzuz-species-import.sql")


def sql_text(value: str | None) -> str:
    if value is None:
        return "null"

    value = value.strip()

    if value == "":
        return "null"

    return "'" + value.replace("'", "''") + "'"


def sql_date(value: str | None) -> str:
    if value is None:
        return "null"

    value = value.strip()

    if value == "":
        return "null"

    for fmt in ("%d.%m.%Y", "%d.%m.%Y %H:%M:%S"):
        try:
            parsed = datetime.strptime(value, fmt)
            return f"'{parsed.date().isoformat()}'"
        except ValueError:
            pass

    raise ValueError(f"Neznámý formát data: {value!r}")


def sql_bool_czech(value: str | None) -> str:
    if value is None:
        return "null"

    value = value.strip().lower()

    if value == "ano":
        return "true"

    if value == "ne":
        return "false"

    if value == "":
        return "null"

    raise ValueError(f"Neznámá boolean hodnota: {value!r}")


def main() -> None:
    if not INPUT_CSV.exists():
        raise FileNotFoundError(
            f"Nenalezen vstupní soubor: {INPUT_CSV.resolve()}"
        )

    OUTPUT_SQL.parent.mkdir(parents=True, exist_ok=True)

    rows: list[dict[str, str]] = []

    with INPUT_CSV.open(
        "r",
        encoding="cp1250",
        newline="",
    ) as handle:
        reader = csv.DictReader(handle, delimiter=";")

        for row in reader:
            rows.append(row)

    statements: list[str] = []

    statements.append(
        "-- Generated from official ÚKZÚZ OOS_CIS01D species catalogue."
    )
    statements.append(
        "-- Do not edit generated rows manually."
    )
    statements.append("begin;")
    statements.append("")

    for row in rows:
        external_code = row["Kód položky"].strip()
        name = row["Název položky"].strip()
        scientific_name = row["Latinský název druhu"].strip()
        valid_from = row["Platnost od"]
        valid_to = row["Platnost do"]
        source_valid = row["Platné"]

        source_reference = (
            f"OOS_CIS01D:Druh:{external_code}"
        )

        statement = f"""
insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  {sql_text(name)},
  {sql_text(scientific_name)},
  {sql_text(SOURCE_LABEL)},
  {sql_text(source_reference)},
  {sql_bool_czech(source_valid)},
  {sql_date(valid_from)},
  {sql_date(valid_to)},
  now(),
  {sql_text(external_code)},
  {sql_text(SOURCE_SYSTEM)},
  {sql_text(source_valid.strip() if source_valid else None)},
  {sql_bool_czech(source_valid)},
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();
""".strip()

        statements.append(statement)
        statements.append("")

    statements.append("commit;")
    statements.append("")

    OUTPUT_SQL.write_text(
        "\n".join(statements),
        encoding="utf-8",
    )

    print(f"Načteno druhů: {len(rows)}")
    print(f"Vygenerováno: {OUTPUT_SQL.resolve()}")


if __name__ == "__main__":
    main()