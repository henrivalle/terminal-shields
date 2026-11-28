import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchCratesLicense } from "./crates.js";

test("/crates/l/:crate reads the expected upstream field", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ crate: { newest_version: "1.0.229" }, versions: [{ num: "2.0.0", license: "GPL-3.0-only", yanked: true }, { num: "1.0.229", license: "MIT OR Apache-2.0", yanked: false }] }));

  assert.deepEqual(await fetchCratesLicense("serde"), { label: "license", message: "MIT OR Apache-2.0", color: "green" });
  assert.equal(fetch.mock.calls[0].arguments[0], "https://crates.io/api/v1/crates/serde");
});

test("/crates/l/:crate rejects missing upstream data", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({}));
  await assert.rejects(fetchCratesLicense("serde"), /no license found/);

  fetch.mock.mockImplementation(async () => new Response(null, { status: 404 }));
  await assert.rejects(fetchCratesLicense("serde"), /crate not found/);
});
