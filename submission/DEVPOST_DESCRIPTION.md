# Aletheia Evidence Desk

## One-line summary

A source-backed human-agent evidence desk where people and agents inspect the same research, focus the same excerpts, and improve a claim without allowing the agent to silently accept its own work.

## Inspiration

Research tools usually split the work in two. People read sources in one interface while an agent searches, summarizes, or drafts somewhere else. That separation makes it difficult to see what evidence changed an answer, which source supports a sentence, or where human judgment entered the process.

Aletheia Evidence Desk makes the open webpage the shared workspace. It demonstrates a Panama Canal history review, but the interaction pattern applies to education, journalism, policy, legal research, and any evidence-heavy workflow where provenance matters.

## What it does

The prototype presents a working claim, three checked institutional sources, linked evidence excerpts, a source catalog, coverage gaps, an agent activity trail, and an explicit review boundary.

A person can move between the Desk, Sources, and Review views; open every citation at its institutional source; inspect evidence; request an additional source; accept or reject a proposed claim; and export a JSON review packet.

An agent can use eight WebMCP site tools to:

- read the current workspace state;
- list the known sources and stable IDs;
- search the checked evidence set;
- focus evidence in the shared canvas;
- select a source in the source rail;
- propose a claim revision with a rationale;
- leave a visible review note; and
- open a bounded request for additional evidence.

Agent proposals remain visibly unaccepted until a person reviews them. The same application remains fully usable when WebMCP is unavailable.

## Why this is a good fit for WebMCP

A remote MCP server could search a database, but it would not automatically share the person's live page context. Aletheia depends on the agent understanding which source is selected, which excerpts are already focused, what proposal is pending, and what the reviewer has accepted. WebMCP exposes those page-native actions directly, so the agent and person operate on one visible state instead of exchanging lossy descriptions across separate interfaces.

The result is also more legible than generic browser automation. The agent calls small, typed, purpose-built tools such as `search_evidence` and `propose_claim_revision`, while the interface shows the consequence of each call in the same workspace.

## How WebMCP improves the user experience

- No copy-and-paste loop between a chat and a research app.
- Evidence selected by the agent becomes visible to the person immediately.
- Every displayed source and excerpt links to the underlying institutional material.
- The activity trail explains what the agent did and why.
- Tool inputs are validated and return actionable recovery guidance.
- Human approval is a product boundary, not a sentence hidden in a prompt.

## What people and agents can do together

A reviewer can ask the agent to strengthen the working claim while preserving public-health and labor-history evidence. The agent reads the workspace, searches the checked corpus, focuses the relevant excerpts, drafts a better claim, and leaves a note explaining what still needs judgment. The reviewer can then inspect the sources, accept the proposal as a draft, request a missing perspective, and export the record of evidence and decisions.

## How it was built

Aletheia is a React and Vite single-page application with link-addressable hash routes. WebMCP tools are registered through `document.modelContext.registerTool` and call the same state handlers used by the human interface. JSON schemas constrain tool inputs, read-only and untrusted-content annotations are applied where appropriate, and automated tests cover the tool handlers and safety boundary.

The public build is deployed by GitHub Actions to GitHub Pages. The repository includes all source code, assets, setup instructions, tests, and an MIT license.

## Challenges and accomplishments

The hardest design problem was making agent action visible without turning the page into a developer console. The interface treats tool calls as ordinary product actions: focused evidence appears in the canvas, source selection appears in the rail, and proposals appear beside the accepted claim. A second challenge was preserving a strict distinction between evidence, interpretation, and approval. The finished prototype provides eight interoperable site tools while keeping the person in control of the final draft.

## What is next

Next steps include user-supplied source collections, persistent projects, citation-range verification, collaborative review, accessibility testing with educators and researchers, and adapters for additional evidence domains.

## Links

- Live prototype: https://gilmolaug.github.io/aletheia-webmcp-challenge/
- Public repository: https://github.com/Gilmolaug/aletheia-webmcp-challenge

