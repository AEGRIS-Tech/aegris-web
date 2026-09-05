const fs = require("fs");
const path = require("path");

const SOURCE_SYSTEM = "UKZUZ_OOS_CIS01D";
const SOURCE_LABEL = "ÚKZÚZ OOS_CIS01D";

const INPUT_XML = path.resolve(
  "scripts",
  "catalog",
  "ukzuz-odrudy-response.xml"
);

const OUTPUT_SQL = path.resolve(
  "scripts",
  "catalog",
  "generated-ukzuz-variety-import.sql"
);

const BATCH_SIZE = 500;

/*
 * Historické kódy druhů, které se v odrůdovém snapshotu vyskytují,
 * ale v aktuálním oficiálním CiselnikDruhu.csv již neexistují.
 *
 * Tyto kódy nepřidáváme uměle do crop_catalog.
 * Odrůdy na ně navázané se při generování importu explicitně přeskočí.
 *
 * Jakýkoli JINÝ chybějící KodDruh stále zastaví SQL preflight.
 */
const EXCLUDED_HISTORICAL_CROP_CODES = new Set([
  "156",
  "157",
  "213",
]);

function decodeXmlEntities(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number(code))
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function extractTag(block, tagName) {
  const nilPattern = new RegExp(
    `<${tagName}\\b[^>]*xsi:nil\\s*=\\s*["']true["'][^>]*/>`,
    "i"
  );

  if (nilPattern.test(block)) {
    return null;
  }

  const selfClosingPattern = new RegExp(
    `<${tagName}\\b[^>]*/>`,
    "i"
  );

  if (selfClosingPattern.test(block)) {
    return "";
  }

  const pattern = new RegExp(
    `<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`,
    "i"
  );

  const match = block.match(pattern);

  if (!match) {
    return null;
  }

  return decodeXmlEntities(match[1]).trim();
}

function extractStatus(block) {
  const statusPattern =
    /<RozhodnutiORegistraciStav\b[^>]*>([\s\S]*?)<\/RozhodnutiORegistraciStav>/i;

  const match = block.match(statusPattern);

  if (!match) {
    return {
      code: null,
      name: null,
    };
  }

  return {
    code: extractTag(match[1], "Kod"),
    name: extractTag(match[1], "Nazev"),
  };
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

function sqlDate(value) {
  if (value === undefined || value === null) {
    return "null";
  }

  const cleaned = String(value).trim();

  if (cleaned === "") {
    return "null";
  }

  const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    throw new Error(
      `Neznámý ISO formát data: ${JSON.stringify(value)}`
    );
  }

  return `'${match[1]}-${match[2]}-${match[3]}'`;
}

function sqlBoolean(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "null";
  }

  const cleaned = String(value).trim().toLowerCase();

  if (cleaned === "true") {
    return "true";
  }

  if (cleaned === "false") {
    return "false";
  }

  throw new Error(
    `Neznámá boolean hodnota: ${JSON.stringify(value)}`
  );
}

function normalizeName(value) {
  if (!value) {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function parseSourceTimestamp(xmlText) {
  const match = xmlText.match(
    /<vOKO:TimeStamp\b[^>]*type=["']base["'][^>]*>([^<]+)<\/vOKO:TimeStamp>/i
  );

  return match ? match[1].trim() : null;
}

function isSelectableStatus(statusCode) {
  return statusCode === "R" || statusCode === "E";
}

function parseRecords(xmlText) {
  const itemPattern =
    /<CiselnikPolozka\b[^>]*>([\s\S]*?)<\/CiselnikPolozka>/gi;

  const records = [];

  let match;

  while ((match = itemPattern.exec(xmlText)) !== null) {
    const block = match[1];
    const status = extractStatus(block);

    const externalCode = extractTag(block, "Kod");

    const name = normalizeName(
      extractTag(block, "Nazev")
    );

    const externalCropCode = extractTag(
      block,
      "KodDruh"
    );

    if (!externalCode) {
      throw new Error(
        "Nalezen záznam odrůdy bez <Kod>."
      );
    }

    if (!name) {
      throw new Error(
        `Nalezena odrůda bez <Nazev>, kód ${externalCode}.`
      );
    }

    if (!externalCropCode) {
      throw new Error(
        `Nalezena odrůda bez <KodDruh>, kód ${externalCode}.`
      );
    }

    records.push({
      externalCode,
      name,
      externalCropCode,

      validFrom: extractTag(
        block,
        "PlatnostOd"
      ),

      validTo: extractTag(
        block,
        "PlatnostDo"
      ),

      registrationDate: extractTag(
        block,
        "RozhodnutiORegistraciDatum"
      ),

      registrationStatusCode: status.code,
      registrationStatus: status.name,

      legalEffectDate: extractTag(
        block,
        "RozhodnutiORegistraciDatumNabytiPravniMoci"
      ),

      registrationEndDate: extractTag(
        block,
        "RozhodnutiORegistraciDatumExspirace"
      ),

      registrationExtendedDate: extractTag(
        block,
        "ProdlouzeniRegistraceDatum"
      ),

      registrationCancelledDate: extractTag(
        block,
        "ZruseniRegistraceDatum"
      ),

      registrationRunoffDate: extractTag(
        block,
        "ZruseniRegistraceDatumDobehu"
      ),

      sourceExternalCode: extractTag(
        block,
        "KodExterni"
      ),

      plantVarietyRights: extractTag(
        block,
        "OchrannaPravaKOdrude"
      ),

      active: isSelectableStatus(
        status.code
      ),
    });
  }

  return records;
}

function validateRecords(records) {
  if (records.length === 0) {
    throw new Error(
      "XML neobsahuje žádné elementy CiselnikPolozka."
    );
  }

  const seenExternalCodes = new Set();
  const duplicateExternalCodes = [];

  for (const record of records) {
    if (
      seenExternalCodes.has(
        record.externalCode
      )
    ) {
      duplicateExternalCodes.push(
        record.externalCode
      );
    } else {
      seenExternalCodes.add(
        record.externalCode
      );
    }
  }

  if (duplicateExternalCodes.length > 0) {
    throw new Error(
      `XML obsahuje duplicitní Kod odrůdy: ${duplicateExternalCodes
        .slice(0, 20)
        .join(", ")}`
    );
  }
}

function makeTempInsert(records) {
  const values = records.map((record) => {
    const sourceReference =
      `OOS_CIS01D:Odruda:${record.externalCode}`;

    return `(
  ${sqlText(record.externalCode)},
  ${sqlText(record.externalCropCode)},
  ${sqlText(record.name)},
  ${sqlText(record.registrationStatus)},
  ${sqlText(record.registrationStatusCode)},
  ${sqlText(record.sourceExternalCode)},
  ${sqlDate(record.validFrom)},
  ${sqlDate(record.validTo)},
  ${sqlDate(record.registrationDate)},
  ${sqlDate(record.registrationEndDate)},
  ${sqlDate(record.legalEffectDate)},
  ${sqlDate(record.registrationExtendedDate)},
  ${sqlDate(record.registrationCancelledDate)},
  ${sqlDate(record.registrationRunoffDate)},
  ${sqlBoolean(record.plantVarietyRights)},
  ${record.active ? "true" : "false"},
  ${sqlText(sourceReference)}
)`;
  });

  return `insert into temp_ukzuz_varieties (
  external_code,
  external_crop_code,
  name,
  registration_status,
  registration_status_code,
  source_external_code,
  valid_from,
  valid_to,
  registration_date,
  registration_end_date,
  legal_effect_date,
  registration_extended_date,
  registration_cancelled_date,
  registration_runoff_date,
  plant_variety_rights,
  active,
  source_reference
)
values
${values.join(",\n")};`;
}

function main() {
  if (!fs.existsSync(INPUT_XML)) {
    throw new Error(
      `Nenalezen vstupní soubor: ${INPUT_XML}`
    );
  }

  const xmlText = fs.readFileSync(
    INPUT_XML,
    "utf8"
  );

  if (!xmlText.includes("OOS_CIS01D")) {
    throw new Error(
      "Vstupní XML nevypadá jako odpověď služby OOS_CIS01D."
    );
  }

  const sourceTimestamp =
    parseSourceTimestamp(xmlText);

  const allRecords =
    parseRecords(xmlText);

  validateRecords(allRecords);

  /*
   * Explicitně oddělíme historické orphan záznamy.
   * Do SQL se vůbec nedostanou.
   */
  const excludedRecords =
    allRecords.filter((record) =>
      EXCLUDED_HISTORICAL_CROP_CODES.has(
        record.externalCropCode
      )
    );

  const records =
    allRecords.filter((record) =>
      !EXCLUDED_HISTORICAL_CROP_CODES.has(
        record.externalCropCode
      )
    );

  /*
   * Guard proti nechtěné změně zdrojových dat.
   * Podle aktuálně analyzovaného XML očekáváme přesně 9 výjimek.
   */
  if (excludedRecords.length !== 9) {
    throw new Error(
      `Počet historických orphan odrůd se změnil. ` +
      `Očekáváno 9, nalezeno ${excludedRecords.length}. ` +
      `Generování zastaveno kvůli kontrole zdroje.`
    );
  }

  const excludedCounts = new Map();

  for (const record of excludedRecords) {
    excludedCounts.set(
      record.externalCropCode,
      (excludedCounts.get(
        record.externalCropCode
      ) ?? 0) + 1
    );
  }

  const expectedExcludedCounts = new Map([
    ["156", 5],
    ["157", 3],
    ["213", 1],
  ]);

  for (
    const [code, expectedCount]
    of expectedExcludedCounts.entries()
  ) {
    const actualCount =
      excludedCounts.get(code) ?? 0;

    if (actualCount !== expectedCount) {
      throw new Error(
        `Historický KodDruh ${code}: ` +
        `očekáváno ${expectedCount} odrůd, ` +
        `nalezeno ${actualCount}. ` +
        `Generování zastaveno kvůli kontrole zdroje.`
      );
    }
  }

  const cropCodes = new Set(
    records.map(
      (record) =>
        record.externalCropCode
    )
  );

  const statusCounts = new Map();

  for (const record of records) {
    const key =
      `${record.registrationStatusCode ?? ""}|${record.registrationStatus ?? ""}`;

    statusCounts.set(
      key,
      (statusCounts.get(key) ?? 0) + 1
    );
  }

  const statements = [];

  statements.push(
    "-- Generated from official ÚKZÚZ OOS_CIS01D variety catalogue."
  );

  statements.push(
    "-- Do not edit generated rows manually."
  );

  if (sourceTimestamp) {
    statements.push(
      `-- Source response timestamp: ${sourceTimestamp}`
    );
  }

  statements.push(
    `-- Parsed varieties from XML: ${allRecords.length}`
  );

  statements.push(
    `-- Excluded historical orphan varieties: ${excludedRecords.length}`
  );

  statements.push(
    `-- Varieties prepared for import: ${records.length}`
  );

  statements.push(
    `-- Distinct species codes prepared for import: ${cropCodes.size}`
  );

  statements.push(
    "-- Explicitly excluded historical species codes: 156, 157, 213"
  );

  statements.push("");
  statements.push("begin;");
  statements.push("");

  statements.push(
`create temporary table temp_ukzuz_varieties (
  external_code text not null,
  external_crop_code text not null,
  name text not null,
  registration_status text,
  registration_status_code text,
  source_external_code text,
  valid_from date,
  valid_to date,
  registration_date date,
  registration_end_date date,
  legal_effect_date date,
  registration_extended_date date,
  registration_cancelled_date date,
  registration_runoff_date date,
  plant_variety_rights boolean,
  active boolean not null,
  source_reference text not null
) on commit drop;`
  );

  statements.push("");

  for (
    let start = 0;
    start < records.length;
    start += BATCH_SIZE
  ) {
    statements.push(
      makeTempInsert(
        records.slice(
          start,
          start + BATCH_SIZE
        )
      )
    );

    statements.push("");
  }

  /*
   * Preflight zůstává zachovaný.
   *
   * Protože 156/157/213 už nejsou v temp tabulce,
   * jakýkoli zde nalezený missing code je NOVÝ,
   * neočekávaný problém a import se zastaví.
   */
  statements.push(
`do $$
declare
  missing_count integer;
  missing_codes text;
begin
  select
    count(*),
    string_agg(
      m.external_crop_code,
      ', '
      order by m.external_crop_code
    )
  into
    missing_count,
    missing_codes
  from (
    select distinct
      t.external_crop_code
    from temp_ukzuz_varieties t
    left join public.crop_catalog c
      on c.source_system = '${SOURCE_SYSTEM}'
     and c.external_code =
       t.external_crop_code
    where c.id is null
  ) m;

  if missing_count > 0 then
    raise exception
      'Import odrůd zastaven: % NEOČEKÁVANÝCH kódů druhů z ÚKZÚZ nemá odpovídající crop_catalog záznam. Kódy: %',
      missing_count,
      missing_codes;
  end if;
end $$;`
  );

  statements.push("");

  statements.push(
`insert into public.variety_catalog (
  crop_id,
  name,
  registration_country,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  external_crop_code,
  registration_status,
  registration_number,
  registration_date,
  registration_end_date,
  source_system,
  registration_status_code,
  source_external_code,
  legal_effect_date,
  registration_extended_date,
  registration_cancelled_date,
  registration_runoff_date,
  plant_variety_rights
)
select
  c.id,
  t.name,
  null,
  '${SOURCE_LABEL}',
  t.source_reference,
  t.active,
  t.valid_from,
  t.valid_to,
  now(),
  t.external_code,
  t.external_crop_code,
  t.registration_status,
  null,
  t.registration_date,
  t.registration_end_date,
  '${SOURCE_SYSTEM}',
  t.registration_status_code,
  t.source_external_code,
  t.legal_effect_date,
  t.registration_extended_date,
  t.registration_cancelled_date,
  t.registration_runoff_date,
  t.plant_variety_rights
from temp_ukzuz_varieties t
join public.crop_catalog c
  on c.source_system =
     '${SOURCE_SYSTEM}'
 and c.external_code =
     t.external_crop_code
on conflict (
  source_system,
  external_code
)
where external_code is not null
do update set
  crop_id =
    excluded.crop_id,

  name =
    excluded.name,

  registration_country =
    excluded.registration_country,

  source =
    excluded.source,

  source_reference =
    excluded.source_reference,

  active =
    excluded.active,

  valid_from =
    excluded.valid_from,

  valid_to =
    excluded.valid_to,

  last_verified_at =
    excluded.last_verified_at,

  external_crop_code =
    excluded.external_crop_code,

  registration_status =
    excluded.registration_status,

  registration_number =
    excluded.registration_number,

  registration_date =
    excluded.registration_date,

  registration_end_date =
    excluded.registration_end_date,

  registration_status_code =
    excluded.registration_status_code,

  source_external_code =
    excluded.source_external_code,

  legal_effect_date =
    excluded.legal_effect_date,

  registration_extended_date =
    excluded.registration_extended_date,

  registration_cancelled_date =
    excluded.registration_cancelled_date,

  registration_runoff_date =
    excluded.registration_runoff_date,

  plant_variety_rights =
    excluded.plant_variety_rights,

  updated_at = now();`
  );

  statements.push("");
  statements.push("commit;");
  statements.push("");

  fs.mkdirSync(
    path.dirname(OUTPUT_SQL),
    {
      recursive: true,
    }
  );

  fs.writeFileSync(
    OUTPUT_SQL,
    statements.join("\n"),
    "utf8"
  );

  console.log(
    `Načteno odrůd z XML: ${allRecords.length}`
  );

  console.log(
    `Historických orphan odrůd přeskočeno: ${excludedRecords.length}`
  );

  console.log(
    "Přeskočené historické KodDruh:"
  );

  for (const code of ["156", "157", "213"]) {
    console.log(
      `  ${code}: ${excludedCounts.get(code) ?? 0}`
    );
  }

  console.log(
    `Odrůd připravených k importu: ${records.length}`
  );

  console.log(
    `Kódů druhů připravených k importu: ${cropCodes.size}`
  );

  console.log(
    "Kontrola unikátních ÚKZÚZ kódů: OK"
  );

  if (sourceTimestamp) {
    console.log(
      `Timestamp zdroje: ${sourceTimestamp}`
    );
  }

  console.log(
    "Stavy registrace importovaných odrůd:"
  );

  for (
    const [key, count]
    of Array.from(
      statusCounts.entries()
    ).sort(
      (a, b) =>
        b[1] - a[1]
    )
  ) {
    const [code, name] =
      key.split("|");

    console.log(
      `  ${code || "(bez kódu)"} - ${name || "(bez názvu)"}: ${count}`
    );
  }

  console.log(
    `Vygenerováno: ${OUTPUT_SQL}`
  );

  console.log(
    "POZOR: SQL zatím nespouštěj v produkci."
  );
}

main();