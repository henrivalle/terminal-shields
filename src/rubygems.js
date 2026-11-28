import { formatMetric } from "./format.js";

const HEADERS = { Accept: "application/json", "User-Agent": "terminal-shields" };

async function fetchRubyGemsData(gem) {
  const name = String(gem ?? "").trim();
  if (!name) throw new Error("gem required");

  const res = await fetch(`https://rubygems.org/api/v1/gems/${encodeURIComponent(name)}.json`, {
    headers: HEADERS
  });
  if (res.status === 404) throw new Error("gem not found");
  if (!res.ok) throw new Error(`RubyGems ${res.status}`);

  return res.json();
}

export async function fetchRubyGemsVersion(gem) {
  const { version } = await fetchRubyGemsData(gem);
  if (typeof version !== "string" || !version) throw new Error("no version found");
  return { label: "gem", message: `v${version.replace(/^v/i, "")}`, color: "blue" };
}

export async function fetchRubyGemsDownloads(gem) {
  const { downloads } = await fetchRubyGemsData(gem);
  if (!Number.isSafeInteger(downloads) || downloads < 0) throw new Error("no download count found");
  return { label: "downloads", message: formatMetric(downloads), color: "blue" };
}
