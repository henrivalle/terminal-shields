import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchHomebrewCaskVersion } from "./homebrew.js";

test("/homebrew/cask/v/:cask reads the expected upstream field", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ version: "1.148.0" }));

  assert.deepEqual(await fetchHomebrewCaskVersion("visual-studio-code"), { label: "homebrew cask", message: "v1.148.0", color: "blue" });
  assert.equal(fetch.mock.calls[0].arguments[0], "https://formulae.brew.sh/api/cask/visual-studio-code.json");
});

test("/homebrew/cask/v/:cask rejects missing upstream data", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({}));
  await assert.rejects(fetchHomebrewCaskVersion("visual-studio-code"), /no version found/);

  fetch.mock.mockImplementation(async () => new Response(null, { status: 404 }));
  await assert.rejects(fetchHomebrewCaskVersion("visual-studio-code"), /cask not found/);
});
