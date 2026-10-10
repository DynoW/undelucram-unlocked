"use strict";

const api = globalThis.browser ?? globalThis.chrome;

const RULESET_ID = "referer";
const TARGET_HOST = "undelucram.ro";
const ISSUES_URL = "https://github.com/DynoW/undelucram-unlocked/issues";

const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const statusText = document.getElementById("statusText");
const report = document.getElementById("report");

report.href = ISSUES_URL;

function isTargetUrl(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host === TARGET_HOST || host.endsWith("." + TARGET_HOST);
  } catch {
    return false;
  }
}

function render(enabled) {
  toggle.checked = enabled;
  status.classList.toggle("on", enabled);
  statusText.textContent = enabled
    ? "Active on undelucram.ro"
    : "Disabled";
}

async function getEnabled() {
  const ids = await api.declarativeNetRequest.getEnabledRulesets();
  return ids.includes(RULESET_ID);
}

async function reloadActiveIfTarget() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id != null && isTargetUrl(tab.url)) {
    await api.tabs.reload(tab.id);
  }
}

async function setEnabled(enabled) {
  await api.declarativeNetRequest.updateEnabledRulesets(
    enabled
      ? { enableRulesetIds: [RULESET_ID] }
      : { disableRulesetIds: [RULESET_ID] }
  );
  render(enabled);
  await reloadActiveIfTarget();
}

toggle.addEventListener("change", async () => {
  const next = toggle.checked;
  toggle.disabled = true;
  try {
    await setEnabled(next);
  } catch (err) {
    render(!next);
    statusText.textContent = "Error: " + (err && err.message ? err.message : err);
  } finally {
    toggle.disabled = false;
  }
});

(async () => {
  try {
    render(await getEnabled());
  } catch (err) {
    statusText.textContent = "Error: " + (err && err.message ? err.message : err);
  }
})();
