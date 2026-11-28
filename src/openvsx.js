import { formatMetric } from "./format.js";

const HEADERS = { Accept: "application/json", "User-Agent": "terminal-shields" };

async function fetchOpenVsxData(rawNamespace, rawExtension) {
  const namespace = String(rawNamespace ?? "").trim();
  if (!/^[A-Za-z0-9_-]+$/.test(namespace)) throw new Error("invalid namespace");
  const extension = String(rawExtension ?? "").trim();
  if (!/^[A-Za-z0-9_-]+$/.test(extension)) throw new Error("invalid extension");

  const response = await fetch(`https://open-vsx.org/api/${encodeURIComponent(namespace)}/${encodeURIComponent(extension)}`, { headers: HEADERS });
  if (response.status === 404) throw new Error("extension not found");
  if (!response.ok) throw new Error(`Open VSX ${response.status}`);

  return response.json();
}

export async function fetchOpenVsxVersion(namespace, extension) {
  const { version } = await fetchOpenVsxData(namespace, extension);
  if (typeof version !== "string" || !version.trim()) throw new Error("no version found");
  return { label: "open vsx", message: `v${version.trim().replace(/^v/i, "")}`, color: "blue" };
}

export async function fetchOpenVsxDownloads(namespace, extension) {
  const { downloadCount } = await fetchOpenVsxData(namespace, extension);
  if (!Number.isSafeInteger(downloadCount) || downloadCount < 0) throw new Error("no download count found");
  return { label: "downloads", message: formatMetric(downloadCount), color: "blue" };
}
