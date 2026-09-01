import test from "node:test";
import assert from "node:assert/strict";
import { initialWorkspace } from "../src/data.js";
import { createToolHandlers } from "../src/toolHandlers.js";

function createHarness() {
  let state = { workspace: structuredClone(initialWorkspace), activity: [] };
  const activity = [];
  const handlers = createToolHandlers({
    getState: () => state,
    updateState: (updater) => { state = updater(state); },
    addActivity: (tool, summary) => activity.push({ tool, summary }),
  });
  return { handlers, getState: () => state, activity };
}

test("lists stable source IDs", () => {
  const { handlers } = createHarness();
  const result = handlers.list_sources();
  assert.equal(result.sources.length, 3);
  assert.deepEqual(result.sources.map((source) => source.id), ["uf-health", "uf-voices", "state-history"]);
});

test("searches evidence by natural-language topics", () => {
  const { handlers } = createHarness();
  const result = handlers.search_evidence({ query: "labor inequality and health" });
  assert.ok(result.count >= 3);
  assert.ok(result.evidence.some((item) => item.id === "labor-conditions"));
  assert.ok(result.evidence.some((item) => item.id === "segregated-rolls"));
});

test("rejects an empty evidence search", () => {
  const { handlers } = createHarness();
  assert.throws(() => handlers.search_evidence({ query: "  " }), /Provide a search query/);
});

test("focuses valid evidence and updates visible state", () => {
  const { handlers, getState } = createHarness();
  const result = handlers.focus_evidence({ evidenceIds: ["labor-conditions", "economic-power"] });
  assert.deepEqual(result.focusedEvidenceIds, ["labor-conditions", "economic-power"]);
  assert.equal(getState().workspace.selectedSourceId, "uf-health");
});

test("rejects unknown evidence IDs with recovery guidance", () => {
  const { handlers } = createHarness();
  assert.throws(() => handlers.focus_evidence({ evidenceIds: ["missing"] }), /Search evidence first/);
});

test("proposal remains unaccepted and needs human review", () => {
  const { handlers, getState } = createHarness();
  const result = handlers.propose_claim_revision({
    claim: "A stronger evidence-backed claim.",
    rationale: "Three focused sources support the revision.",
  });
  assert.equal(result.accepted, false);
  assert.equal(getState().workspace.claim, initialWorkspace.claim);
  assert.equal(getState().workspace.suggestion, "A stronger evidence-backed claim.");
  assert.equal(getState().workspace.reviewStatus, "Needs human review");
});

test("adds a visible review note", () => {
  const { handlers, getState } = createHarness();
  handlers.leave_review_note({ note: "Separate documented evidence from interpretation." });
  assert.equal(getState().workspace.note, "Separate documented evidence from interpretation.");
});

test("records a bounded source request without inventing a source", () => {
  const { handlers, getState, activity } = createHarness();
  const result = handlers.request_additional_source({
    topic: "Panamanian perspectives",
    question: "Find a source that centers Panamanian perspectives on sovereignty.",
  });
  assert.equal(result.sourceRequest.status, "Open");
  assert.equal(getState().workspace.reviewStatus, "Needs source");
  assert.equal(getState().workspace.sourceRequest.topic, "Panamanian perspectives");
  assert.equal(activity.at(-1).tool, "request_additional_source");
});

test("rejects an empty source request", () => {
  const { handlers } = createHarness();
  assert.throws(
    () => handlers.request_additional_source({ topic: "", question: "" }),
    /Provide a topic/,
  );
});
