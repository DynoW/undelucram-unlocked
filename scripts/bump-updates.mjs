import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!version) {
  console.error("usage: node scripts/bump-updates.mjs <version>");
  process.exit(1);
}

const ADDON_ID = "undelucram-unlocked@dynow.github.io";
const UPDATE_LINK =
  "https://github.com/DynoW/undelucram-unlocked/releases/latest/download/undelucram-unlocked.xpi";

const file = new URL("../updates.json", import.meta.url);
const data = JSON.parse(readFileSync(file, "utf8"));

const addon = data.addons?.[ADDON_ID];
if (!addon) {
  console.error(`updates.json: add-on ${ADDON_ID} not found`);
  process.exit(1);
}

const existing = addon.updates.find((u) => u.version === version);
if (existing) {
  existing.update_link = UPDATE_LINK;
} else {
  addon.updates.push({ version, update_link: UPDATE_LINK });
}

addon.updates.sort((a, b) =>
  a.version.localeCompare(b.version, undefined, { numeric: true })
);

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`updates.json: recorded version ${version}`);
