import { evidence, evidenceById, sourceById, sources } from "./data.js";

const normalize = (value) => String(value ?? "").trim();

export function createToolHandlers({ getState, updateState, addActivity }) {
  const listSources = () => ({
    sources: sources.map(({ id, name, institution, kind, coverage, summary }) => ({
      id,
      name,
      institution,
      kind,
      coverage,
      summary,
    })),
  });

  const getWorkspaceState = () => {
    const state = getState();
    return {
      claim: state.workspace.claim,
      proposedClaim: state.workspace.suggestion,
      humanNote: state.workspace.note,
      reviewStatus: state.workspace.reviewStatus,
      selectedSourceId: state.workspace.selectedSourceId,
      focusedEvidenceIds: state.workspace.focusedEvidenceIds,
    };
  };

  const searchEvidence = ({ query }) => {
    const cleanQuery = normalize(query);
    if (!cleanQuery) throw new Error("Provide a search query with at least one topic or phrase.");
    if (cleanQuery.length > 120) throw new Error("Keep the evidence query at 120 characters or fewer.");

    const terms = cleanQuery.toLowerCase().split(/\s+/).filter((term) => term.length > 2);
    const matches = evidence
      .map((item) => {
        const source = sourceById.get(item.sourceId);
        const haystack = `${item.paraphrase} ${item.topic.join(" ")} ${source.name} ${source.summary}`.toLowerCase();
        const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
        return { item, source, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    addActivity("search_evidence", `Searched for “${cleanQuery}” and found ${matches.length} relevant excerpts.`);

    return {
      query: cleanQuery,
      count: matches.length,
      evidence: matches.map(({ item, source }) => ({
        id: item.id,
        sourceId: item.sourceId,
        source: source.name,
        paraphrase: item.paraphrase,
        locator: item.locator,
      })),
      guidance: matches.length ? "Use focus_evidence to place the strongest items in human view." : "Try broader terms.",
    };
  };

  const focusEvidence = ({ evidenceIds }) => {
    if (!Array.isArray(evidenceIds) || evidenceIds.length === 0) {
      throw new Error("Provide one or more evidence IDs returned by search_evidence.");
    }
    const unique = [...new Set(evidenceIds.map(normalize))];
    const missing = unique.filter((id) => !evidenceById.has(id));
    if (missing.length) throw new Error(`Unknown evidence ID: ${missing.join(", ")}. Search evidence first.`);
    if (unique.length > 4) throw new Error("Focus no more than four evidence items at a time.");

    const first = evidenceById.get(unique[0]);
    updateState((previous) => ({
      ...previous,
      workspace: {
        ...previous.workspace,
        focusedEvidenceIds: unique,
        selectedSourceId: first.sourceId,
        reviewStatus: "Needs human review",
      },
    }));
    addActivity("focus_evidence", `Focused ${unique.length} evidence excerpts on the shared canvas.`);

    return {
      focusedEvidenceIds: unique,
      selectedSourceId: first.sourceId,
      visibleChange: `${unique.length} excerpts are now selected in the evidence canvas.`,
    };
  };

  const proposeClaimRevision = ({ claim, rationale }) => {
    const cleanClaim = normalize(claim);
    const cleanRationale = normalize(rationale);
    if (!cleanClaim) throw new Error("Provide the proposed claim text.");
    if (cleanClaim.length > 320) throw new Error("Keep the proposed claim at 320 characters or fewer.");
    if (!cleanRationale) throw new Error("Explain briefly how the visible evidence supports the proposal.");
    if (cleanRationale.length > 420) throw new Error("Keep the rationale at 420 characters or fewer.");

    updateState((previous) => ({
      ...previous,
      workspace: {
        ...previous.workspace,
        suggestion: cleanClaim,
        rationale: cleanRationale,
        reviewStatus: "Needs human review",
      },
    }));
    addActivity("propose_claim_revision", "Added a claim proposal without changing the accepted draft.");

    return {
      proposedClaim: cleanClaim,
      reviewStatus: "Needs human review",
      accepted: false,
      visibleChange: "The proposal and rationale are now visible in Agent workspace.",
      nextStep: "The human can accept it as a draft, ask for another source, or leave a note.",
    };
  };

  const leaveReviewNote = ({ note }) => {
    const cleanNote = normalize(note);
    if (!cleanNote) throw new Error("Provide a review note.");
    if (cleanNote.length > 240) throw new Error("Keep the review note at 240 characters or fewer.");

    updateState((previous) => ({
      ...previous,
      workspace: { ...previous.workspace, note: cleanNote, reviewStatus: "Needs human review" },
    }));
    addActivity("leave_review_note", "Added a visible note for the person reviewing the claim.");

    return {
      note: cleanNote,
      reviewStatus: "Needs human review",
      visibleChange: "The note is attached to the working claim.",
    };
  };

  const setSourceFocus = ({ sourceId }) => {
    const cleanId = normalize(sourceId);
    const source = sourceById.get(cleanId);
    if (!source) throw new Error("Unknown source ID. Call list_sources to get valid IDs.");

    updateState((previous) => ({
      ...previous,
      workspace: { ...previous.workspace, selectedSourceId: cleanId },
    }));
    addActivity("set_source_focus", `Focused ${source.shortName} in the source rail.`);
    return { sourceId: cleanId, source: source.name, visibleChange: "The source is selected in the left rail." };
  };

  return {
    list_sources: listSources,
    get_workspace_state: getWorkspaceState,
    search_evidence: searchEvidence,
    focus_evidence: focusEvidence,
    propose_claim_revision: proposeClaimRevision,
    leave_review_note: leaveReviewNote,
    set_source_focus: setSourceFocus,
  };
}
