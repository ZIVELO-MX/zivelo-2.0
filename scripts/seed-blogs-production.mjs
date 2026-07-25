import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const expectedProjectRef = "yauzyuewbhzodzkynond";
const projectRef = process.env.SUPABASE_PROJECT_REF;
const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const confirmation = process.env.CONFIRM_PRODUCTION_BLOG_SEED;

if (projectRef !== expectedProjectRef) {
  console.error(
    `Refusing production blog seed: SUPABASE_PROJECT_REF must equal ${expectedProjectRef}.`,
  );
  process.exit(1);
}

if (!databaseUrl) {
  console.error("Set SUPABASE_DB_URL (or DATABASE_URL) before importing blog fixtures.");
  process.exit(1);
}

if (confirmation !== "WEB-0022") {
  console.error("Set CONFIRM_PRODUCTION_BLOG_SEED=WEB-0022 to confirm the production import.");
  process.exit(1);
}

const seedFiles = ["supabase/seed.sql", "supabase/seed-blog-fixtures.sql"].map((file) =>
  resolve(process.cwd(), file),
);
const missingFile = seedFiles.find((file) => !existsSync(file));
if (missingFile) {
  console.error(`Seed file not found: ${missingFile}`);
  process.exit(1);
}

for (const seedFile of seedFiles) {
  const result = spawnSync(
    "psql",
    ["--dbname", databaseUrl, "--set", "ON_ERROR_STOP=1", "--file", seedFile],
    { stdio: "inherit" },
  );

  if (result.error) {
    console.error(`Unable to run psql: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) process.exit(result.status ?? 1);
}

process.exit(0);
