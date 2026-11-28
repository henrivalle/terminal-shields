const HEADERS = { Accept: "application/json", "User-Agent": "terminal-shields" };

function packageName(raw) {
  const name = String(raw ?? "").trim();
  if (!name) throw new Error("package required");
  return name;
}

async function fetchPypiInfo(pkg) {
  const name = packageName(pkg);
  const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`, { headers: HEADERS });
  if (res.status === 404) throw new Error("package not found");
  if (!res.ok) throw new Error(`PyPI ${res.status}`);

  const data = await res.json();
  return data.info ?? {};
}

export async function fetchPypiVersion(pkg) {
  const { version } = await fetchPypiInfo(pkg);
  if (!version) throw new Error("no version found");
  return { label: "pypi", message: `v${String(version).replace(/^v/i, "")}`, color: "blue" };
}

const DOWNLOAD_PERIODS = {
  dd: { key: "last_day", unit: "day" },
  dw: { key: "last_week", unit: "week" },
  dm: { key: "last_month", unit: "month" }
};

export async function fetchPypiDownloads(pkg, interval) {
  const spec = DOWNLOAD_PERIODS[interval];
  if (!spec) throw new Error("interval must be dd, dw or dm");
  // pypistats wants the normalized (PEP 503) name
  const name = packageName(pkg).toLowerCase().replace(/[-_.]+/g, "-");
  const res = await fetch(`https://pypistats.org/api/packages/${encodeURIComponent(name)}/recent`, {
    headers: HEADERS
  });
  if (res.status === 404) throw new Error("package not found");
  if (!res.ok) throw new Error(`pypistats ${res.status}`);

  const data = await res.json();
  const count = Number(data.data?.[spec.key] ?? 0);
  return {
    label: "downloads",
    count,
    unit: spec.unit,
    color: count > 0 ? "brightgreen" : "lightgrey"
  };
}

export async function fetchPypiTypes(pkg) {
  const { classifiers = [] } = await fetchPypiInfo(pkg);
  const message = classifiers.includes("Typing :: Stubs Only")
    ? "stubs"
    : classifiers.includes("Typing :: Typed") ? "typed" : "untyped";
  return { label: "types", message, color: message === "untyped" ? "lightgrey" : "blue" };
}
