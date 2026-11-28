import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchRubyGemsDownloads } from "./rubygems.js";

test("/gem/dt/:gem reads the expected upstream field", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ version: "8.1.0", downloads: 12000000 }));

  assert.deepEqual(await fetchRubyGemsDownloads("rails"), { label: "downloads", message: "12M", color: "blue" });
  assert.equal(fetch.mock.calls[0].arguments[0], "https://rubygems.org/api/v1/gems/rails.json");
});

test("/gem/dt/:gem rejects missing upstream data", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({}));
  await assert.rejects(fetchRubyGemsDownloads("rails"), /no download count found/);

  fetch.mock.mockImplementation(async () => new Response(null, { status: 404 }));
  await assert.rejects(fetchRubyGemsDownloads("rails"), /gem not found/);
});
