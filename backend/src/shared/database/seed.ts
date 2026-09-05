import { icpService } from "../../features/icp/icp.service.js";
import { importDemoLeads } from "../../features/import/import.service.js";
import { analyzeLeads } from "../../features/scoring/scoring.service.js";
import { pool } from "./connection.js";

const icp = await icpService.createDemo();
await importDemoLeads();
await analyzeLeads(icp.id);
console.log("Seeded demo ICP, leads, and scores.");
await pool.end();
