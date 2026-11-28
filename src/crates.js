const HEADERS = { Accept: "application/json", "User-Agent": "terminal-shields (https://github.com/seuthootDev/terminal-shields)" };

export async function fetchCratesLicense(rawCrate) {
  const crate = String(rawCrate ?? "").trim();
  if (!/^[A-Za-z0-9_-]+$/.test(crate)) throw new Error("invalid crate name");

  const response = await fetch(`https://crates.io/api/v1/crates/${encodeURIComponent(crate)}`, { headers: HEADERS });
  if (response.status === 404) throw new Error("crate not found");
  if (!response.ok) throw new Error(`crates.io ${response.status}`);

  const { crate: metadata, versions } = await response.json();
  const version = Array.isArray(versions) && metadata?.newest_version
    ? versions.find(({ num, yanked }) => num === metadata.newest_version && !yanked)
    : undefined;
  const license = version?.license;
  if (typeof license !== "string" || !license.trim()) throw new Error("no license found");
  return { label: "license", message: license.trim(), color: "green" };
}
