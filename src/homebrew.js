const HEADERS = { Accept: "application/json", "User-Agent": "terminal-shields" };

async function fetchHomebrewFormula(rawFormula) {
  const formula = String(rawFormula ?? "").trim();
  if (!/^[\w@+.-]+$/.test(formula) || formula === "." || formula === "..") throw new Error("invalid formula");

  const response = await fetch(`https://formulae.brew.sh/api/formula/${encodeURIComponent(formula)}.json`, { headers: HEADERS });
  if (response.status === 404) throw new Error("formula not found");
  if (!response.ok) throw new Error(`Homebrew ${response.status}`);

  return { formula, data: await response.json() };
}

export async function fetchHomebrewVersion(rawFormula) {
  const { data } = await fetchHomebrewFormula(rawFormula);
  const version = data.versions?.stable;
  if (typeof version !== "string" || !version.trim()) throw new Error("no version found");
  return { label: "homebrew", message: `v${version.trim().replace(/^v/i, "")}`, color: "blue" };
}

const INSTALL_PERIODS = {
  dm: { key: "30d", unit: "month" },
  dq: { key: "90d", unit: "quarter" },
  dy: { key: "365d", unit: "year" },
};

export async function fetchHomebrewInstalls(rawFormula, period) {
  const spec = INSTALL_PERIODS[period];
  if (!spec || !Object.hasOwn(INSTALL_PERIODS, period)) throw new Error("period must be dm, dq or dy");
  const { formula, data } = await fetchHomebrewFormula(rawFormula);
  const count = data.analytics?.install?.[spec.key]?.[data.name ?? formula];
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("no install count found");
  return { label: "installs", count, unit: spec.unit, color: count > 0 ? "brightgreen" : "lightgrey" };
}
