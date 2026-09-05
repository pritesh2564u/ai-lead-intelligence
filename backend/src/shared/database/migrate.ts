import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./connection.js";

const dir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "migrations",
);
for (const file of fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    await pool.query(sql);
    console.log(`Applied ${file}`);
}
await pool.end();
