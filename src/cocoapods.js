const HEADERS = { Accept: "application/json", "User-Agent": "terminal-shields" };

export async function fetchCocoaPodsVersion(rawPod) {
  const pod = String(rawPod ?? "").trim();
  if (!/^[\w+.-]+$/.test(pod) || pod === "." || pod === "..") throw new Error("invalid pod name");

  const response = await fetch(`https://trunk.cocoapods.org/api/v1/pods/${encodeURIComponent(pod)}`, { headers: HEADERS });
  if (response.status === 404) throw new Error("pod not found");
  if (!response.ok) throw new Error(`CocoaPods ${response.status}`);

  const { versions } = await response.json();
  const version = Array.isArray(versions) ? versions.at(-1)?.name : undefined;
  if (typeof version !== "string" || !version.trim()) throw new Error("no version found");
  return { label: "pod", message: `v${version.trim().replace(/^v/i, "")}`, color: "blue" };
}
