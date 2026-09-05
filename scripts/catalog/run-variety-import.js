const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const DB_CONFIG = {
  host: "aws-0-eu-central-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.pukejondnesnkturqkgb",
  password: process.env.AEGRIS_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
};

const SQL_FILE = path.resolve(
  __dirname,
  "generated-ukzuz-variety-import.sql"
);

const EXPECTED_VARIETY_COUNT = "15079";
const EXPECTED_SPECIES_COUNT = "529";

async function main() {
  const importMode = process.argv.includes("--import");

  if (!DB_CONFIG.password) {
    throw new Error(
      "Chybí AEGRIS_DB_PASSWORD. Nastav heslo v aktuálním PowerShellu."
    );
  }

  const client = new Client(DB_CONFIG);

  try {
    console.log("AegRIS ÚKZÚZ variety import");
    console.log("----------------------------------------");
    console.log("Připojuji se k Supabase PRODUCTION...");

    await client.connect();

    const connectionCheck = await client.query(`
      select
        current_database() as database_name,
        current_user as database_user,
        now() as server_time
    `);

    console.log("Připojení: OK");
    console.log(
      `Database: ${connectionCheck.rows[0].database_name}`
    );
    console.log(
      `User: ${connectionCheck.rows[0].database_user}`
    );
    console.log(
      `Server time: ${connectionCheck.rows[0].server_time}`
    );

    const existing = await client.query(`
      select count(*)::bigint as count
      from public.variety_catalog
      where source_system = 'UKZUZ_OOS_CIS01D'
    `);

    console.log(
      `Aktuálně ÚKZÚZ odrůd ve variety_catalog: ${existing.rows[0].count}`
    );

    if (!importMode) {
      console.log("----------------------------------------");
      console.log("TEST PŘIPOJENÍ HOTOV.");
      console.log("Do databáze nebyla zapsána žádná data.");
      console.log(
        "Pro skutečný import spusť script s parametrem --import."
      );
      return;
    }

    if (!fs.existsSync(SQL_FILE)) {
      throw new Error(`SQL soubor neexistuje: ${SQL_FILE}`);
    }

    console.log("----------------------------------------");
    console.log("Načítám importní SQL...");

    const sql = fs.readFileSync(SQL_FILE, "utf8");

    if (!sql.trim()) {
      throw new Error("Importní SQL soubor je prázdný.");
    }

    if (!/temp_ukzuz_varieties/i.test(sql)) {
      throw new Error(
        "Bezpečnostní kontrola selhala: SQL neobsahuje temp_ukzuz_varieties."
      );
    }

    if (
      !/on\s+conflict\s*\(\s*source_system\s*,\s*external_code\s*\)/i.test(
        sql
      )
    ) {
      throw new Error(
        "Bezpečnostní kontrola selhala: SQL neobsahuje očekávaný ON CONFLICT."
      );
    }

    if (!/left\s+join\s+public\.crop_catalog/i.test(sql)) {
      throw new Error(
        "Bezpečnostní kontrola selhala: SQL neobsahuje preflight kontrolu crop_catalog."
      );
    }

    if (!/raise\s+exception/i.test(sql)) {
      throw new Error(
        "Bezpečnostní kontrola selhala: SQL neobsahuje RAISE EXCEPTION."
      );
    }

    if (!/\bbegin\s*;/i.test(sql)) {
      throw new Error(
        "Bezpečnostní kontrola selhala: SQL neobsahuje BEGIN."
      );
    }

    if (!/\bcommit\s*;/i.test(sql)) {
      throw new Error(
        "Bezpečnostní kontrola selhala: SQL neobsahuje COMMIT."
      );
    }

    if (
      !sql.includes(
        "-- Varieties prepared for import: 15079"
      )
    ) {
      throw new Error(
        "Bezpečnostní kontrola selhala: SQL nemá očekávaný počet 15079 odrůd."
      );
    }

    if (
      !sql.includes(
        "-- Explicitly excluded historical species codes: 156, 157, 213"
      )
    ) {
      throw new Error(
        "Bezpečnostní kontrola selhala: SQL neobsahuje očekávané historické výjimky 156, 157, 213."
      );
    }

    const sizeMb =
      Buffer.byteLength(sql, "utf8") / 1024 / 1024;

    console.log(`SQL soubor: ${SQL_FILE}`);
    console.log(`Velikost SQL: ${sizeMb.toFixed(2)} MB`);
    console.log("Bezpečnostní kontrola SQL: OK");
    console.log("----------------------------------------");
    console.log("Spouštím import do PRODUCTION...");

    await client.query(sql);

    console.log("SQL import dokončen.");
    console.log("----------------------------------------");
    console.log("Provádím kontrolu výsledku...");

    const validation = await client.query(`
      select
        count(*)::bigint as variety_count,
        count(distinct external_crop_code)::bigint as species_count
      from public.variety_catalog
      where source_system = 'UKZUZ_OOS_CIS01D'
    `);

    const brokenLinks = await client.query(`
      select count(*)::bigint as broken_links
      from public.variety_catalog v
      left join public.crop_catalog c
        on c.id = v.crop_id
      where v.source_system = 'UKZUZ_OOS_CIS01D'
        and c.id is null
    `);

    const excludedHistorical = await client.query(`
      select count(*)::bigint as excluded_historical_present
      from public.variety_catalog
      where source_system = 'UKZUZ_OOS_CIS01D'
        and external_crop_code in ('156', '157', '213')
    `);

    const varietyCount =
      validation.rows[0].variety_count;

    const speciesCount =
      validation.rows[0].species_count;

    const brokenLinkCount =
      brokenLinks.rows[0].broken_links;

    const excludedHistoricalPresent =
      excludedHistorical.rows[0].excluded_historical_present;

    console.log("VALIDACE IMPORTU");
    console.log(`Počet odrůd: ${varietyCount}`);
    console.log(`Počet druhů: ${speciesCount}`);
    console.log(
      `Poškozené vazby crop_id: ${brokenLinkCount}`
    );
    console.log(
      `Historické orphan odrůdy v DB: ${excludedHistoricalPresent}`
    );

    if (varietyCount !== EXPECTED_VARIETY_COUNT) {
      throw new Error(
        `Neočekávaný počet odrůd: ${varietyCount}, očekáváno ${EXPECTED_VARIETY_COUNT}.`
      );
    }

    if (speciesCount !== EXPECTED_SPECIES_COUNT) {
      throw new Error(
        `Neočekávaný počet druhů: ${speciesCount}, očekáváno ${EXPECTED_SPECIES_COUNT}.`
      );
    }

    if (brokenLinkCount !== "0") {
      throw new Error(
        `Nalezeny poškozené vazby crop_id: ${brokenLinkCount}.`
      );
    }

    if (excludedHistoricalPresent !== "0") {
      throw new Error(
        `V databázi jsou neočekávaně historické orphan odrůdy: ${excludedHistoricalPresent}.`
      );
    }

    console.log("----------------------------------------");
    console.log("IMPORT ÚSPĚŠNĚ DOKONČEN A OVĚŘEN.");
    console.log("Odrůdy: 15079 / 15079");
    console.log("Druhy: 529 / 529");
    console.log("Poškozené vazby: 0");
    console.log("Historické orphan odrůdy v DB: 0");
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error("----------------------------------------");
  console.error("CHYBA:");
  console.error(error.message);

  if (error.code) {
    console.error("PostgreSQL code:", error.code);
  }

  if (error.detail) {
    console.error("Detail:", error.detail);
  }

  if (error.hint) {
    console.error("Hint:", error.hint);
  }

  if (error.where) {
    console.error("Where:", error.where);
  }

  process.exitCode = 1;
});