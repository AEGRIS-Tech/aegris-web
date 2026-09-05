const fs = require("fs");
const path = require("path");

const SOURCE_SYSTEM = "UKZUZ_OOS_CIS01D";
const SOURCE_LABEL = "ÚKZÚZ OOS_CIS01D";

const INPUT_CSV = path.resolve("CiselnikDruhu.csv");
const OUTPUT_SQL = path.resolve(
  "scripts",
  "catalog",
  "generated-ukzuz-species-import.sql"
);

function parseCsv(text, delimiter = ";") {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }

      row.push(field);
      field = "";

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  if (field !== "" || row.length > 0) {
    row.push(field);

    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function sqlText(value) {
  if (value === undefined || value === null) {
    return "null";
  }

  const cleaned = String(value).trim();

  if (cleaned === "") {
    return "null";
  }

  return `'${cleaned.replace(/'/g, "''")}'`;
}

function sqlBooleanCzech(value) {
  if (value === undefined || value === null) {
    return "null";
  }

  const cleaned = String(value).trim().toLowerCase();

  if (cleaned === "ano") {
    return "true";
  }

  if (cleaned === "ne") {
    return "false";
  }

  if (cleaned === "") {
    return "null";
  }

  throw new Error(`Neznámá boolean hodnota: ${JSON.stringify(value)}`);
}

function sqlDate(value) {
  if (value === undefined || value === null) {
    return "null";
  }

  const cleaned = String(value).trim();

  if (cleaned === "") {
    return "null";
  }

  const match = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);

  if (!match) {
    throw new Error(`Neznámý formát data: ${JSON.stringify(value)}`);
  }

  const [, day, month, year] = match;

  return `'${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}'`;
}

function main() {
  if (!fs.existsSync(INPUT_CSV)) {
    throw new Error(`Nenalezen vstupní soubor: ${INPUT_CSV}`);
  }

  const rawBuffer = fs.readFileSync(INPUT_CSV);

  const decoder = new TextDecoder("windows-1250");
  const csvText = decoder.decode(rawBuffer);

  const parsedRows = parseCsv(csvText, ";");

  if (parsedRows.length < 2) {
    throw new Error("CSV neobsahuje očekávaná data.");
  }

  const headers = parsedRows[0].map((header) => header.trim());

  const requiredHeaders = [
    "Kód položky",
    "Název položky",
    "Platné",
    "Platnost od",
    "Platnost do",
    "Latinský název druhu",
  ];

  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      throw new Error(
        `V CSV chybí povinný sloupec: ${requiredHeader}`
      );
    }
  }

  const records = parsedRows.slice(1).map((values) => {
    const record = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });

    return record;
  });

  const statements = [];

  statements.push(
    "-- Generated from official ÚKZÚZ OOS_CIS01D species catalogue."
  );
  statements.push("-- Do not edit generated rows manually.");
  statements.push("begin;");
  statements.push("");

  for (const record of records) {
    const externalCode = record["Kód položky"].trim();
    const name = record["Název položky"].trim();
    const scientificName =
      record["Latinský název druhu"].trim();

    const validFrom = record["Platnost od"];
    const validTo = record["Platnost do"];
    const sourceValid = record["Platné"];

    if (!externalCode) {
      throw new Error(
        `Nalezen druh bez kódu: ${JSON.stringify(record)}`
      );
    }

    if (!name) {
      console.warn(
        `Přeskakuji druh bez názvu, kód ${externalCode}`
      );
      continue;
    }

    const sourceReference = `OOS_CIS01D:Druh:${externalCode}`;

    const statement = `
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
  ${sqlText(name)},
  ${sqlText(scientificName)},
  ${sqlText(SOURCE_LABEL)},
  ${sqlText(sourceReference)},
  ${sqlBooleanCzech(sourceValid)},
  ${sqlDate(validFrom)},
  ${sqlDate(validTo)},
  now(),
  ${sqlText(externalCode)},
  ${sqlText(SOURCE_SYSTEM)},
  ${sqlText(sourceValid)},
  ${sqlBooleanCzech(sourceValid)},
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
`.trim();

    statements.push(statement);
    statements.push("");
  }

  statements.push("commit;");
  statements.push("");

  fs.mkdirSync(path.dirname(OUTPUT_SQL), {
    recursive: true,
  });

  fs.writeFileSync(
    OUTPUT_SQL,
    statements.join("\n"),
    "utf8"
  );

  console.log(`Načteno druhů: ${records.length}`);
  console.log(`Vygenerováno: ${OUTPUT_SQL}`);
}

main();