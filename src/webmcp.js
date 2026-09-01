const emptySchema = { type: "object", properties: {}, additionalProperties: false };

export const toolDefinitions = [
  {
    name: "get_workspace_state",
    title: "Read workspace state",
    description: "Read the current claim, proposal, human note, selected source, focused evidence, and review status.",
    inputSchema: emptySchema,
    annotations: { readOnlyHint: true },
  },
  {
    name: "list_sources",
    title: "List evidence sources",
    description: "List the evidence sources available in this workspace with stable IDs, institutions, coverage, and summaries.",
    inputSchema: emptySchema,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
  },
  {
    name: "search_evidence",
    title: "Search evidence",
    description: "Search the workspace's sourced evidence by topic or plain-language phrase. Returns stable evidence IDs for later focus.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", minLength: 1, maxLength: 120, description: "Topics or a phrase to find in the evidence set." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
  },
  {
    name: "focus_evidence",
    title: "Focus evidence",
    description: "Place one to four known evidence excerpts in the shared canvas for the person to inspect. This changes visible selection state.",
    inputSchema: {
      type: "object",
      properties: {
        evidenceIds: {
          type: "array",
          minItems: 1,
          maxItems: 4,
          items: { type: "string" },
          description: "Evidence IDs previously returned by search_evidence.",
        },
      },
      required: ["evidenceIds"],
      additionalProperties: false,
    },
  },
  {
    name: "propose_claim_revision",
    title: "Propose claim revision",
    description: "Add a proposed claim and evidence rationale to Agent workspace. The proposal stays unaccepted until the person reviews it.",
    inputSchema: {
      type: "object",
      properties: {
        claim: { type: "string", minLength: 1, maxLength: 320, description: "A concise evidence-backed claim for human review." },
        rationale: { type: "string", minLength: 1, maxLength: 420, description: "How the focused evidence supports or qualifies the claim." },
      },
      required: ["claim", "rationale"],
      additionalProperties: false,
    },
  },
  {
    name: "leave_review_note",
    title: "Leave review note",
    description: "Attach a short note to the working claim so the person and agent can keep a visible review instruction in context.",
    inputSchema: {
      type: "object",
      properties: {
        note: { type: "string", minLength: 1, maxLength: 240, description: "The review instruction to attach to the claim." },
      },
      required: ["note"],
      additionalProperties: false,
    },
  },
  {
    name: "set_source_focus",
    title: "Focus source",
    description: "Select one known source in the left rail so its provenance and related evidence are visible to the person.",
    inputSchema: {
      type: "object",
      properties: {
        sourceId: { type: "string", minLength: 1, maxLength: 40, description: "A source ID returned by list_sources." },
      },
      required: ["sourceId"],
      additionalProperties: false,
    },
  },
  {
    name: "request_additional_source",
    title: "Request another source",
    description: "Record a bounded evidence gap for human review. This creates a visible request but does not attach or invent a source.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", minLength: 1, maxLength: 80, description: "Short label for the missing perspective or evidence area." },
        question: { type: "string", minLength: 1, maxLength: 320, description: "What evidence should be found and why the current set is incomplete." },
      },
      required: ["topic", "question"],
      additionalProperties: false,
    },
  },
];

export async function registerWebMcpTools(handlers) {
  const registerTool = document.modelContext?.registerTool;
  if (typeof registerTool !== "function") {
    return { supported: false, count: 0, names: [], cleanup: () => {} };
  }

  const controller = new AbortController();
  const names = [];

  for (const definition of toolDefinitions) {
    const execute = handlers[definition.name];
    await document.modelContext.registerTool(
      {
        ...definition,
        execute: async (input = {}) => execute(input),
      },
      { signal: controller.signal },
    );
    names.push(definition.name);
  }

  return {
    supported: true,
    count: names.length,
    names,
    cleanup: () => controller.abort(),
  };
}
