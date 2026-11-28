import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchOpenVsxDownloads } from "./openvsx.js";

test("/open-vsx/dt/:namespace/:extension reads the expected upstream field", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ version: "12.1.0", downloadCount: 1100000 }));

  assert.deepEqual(await fetchOpenVsxDownloads("esbenp", "prettier-vscode"), { label: "downloads", message: "1.1M", color: "blue" });
  assert.equal(fetch.mock.calls[0].arguments[0], "https://open-vsx.org/api/esbenp/prettier-vscode");
});

test("/open-vsx/dt/:namespace/:extension rejects missing upstream data", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({}));
  await assert.rejects(fetchOpenVsxDownloads("esbenp", "prettier-vscode"), /no download count found/);

  fetch.mock.mockImplementation(async () => new Response(null, { status: 404 }));
  await assert.rejects(fetchOpenVsxDownloads("esbenp", "prettier-vscode"), /extension not found/);
});
