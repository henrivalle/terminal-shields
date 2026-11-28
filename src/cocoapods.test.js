import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchCocoaPodsVersion } from "./cocoapods.js";

test("reads the most recent entry from the CocoaPods version list", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ versions: [{ name: "1.1.3" }, { name: "5.9.1" }] }),
  );
  assert.deepEqual(await fetchCocoaPodsVersion("Alamofire"), {
    label: "pod", message: "v5.9.1", color: "blue",
  });
  assert.equal(fetch.mock.calls[0].arguments[0], "https://trunk.cocoapods.org/api/v1/pods/Alamofire");
});

test("reports an empty version list or a missing pod as unavailable", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ versions: [] }));
  await assert.rejects(fetchCocoaPodsVersion("Alamofire"), /no version found/);
  fetch.mock.mockImplementation(async () => new Response(null, { status: 404 }));
  await assert.rejects(fetchCocoaPodsVersion("Alamofire"), /pod not found/);
});
