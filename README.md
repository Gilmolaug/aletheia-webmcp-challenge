# Aletheia Evidence Desk

A WebMCP-enabled evidence workspace where a person and an agent review the same sources, claim, citations, and approval state on one live page.

## Why WebMCP

A remote MCP server can search a service, but this product depends on shared page context. The agent can inspect the open workspace, search a known evidence set, focus excerpts in the human's canvas, and add a claim proposal that remains unaccepted until the person reviews it.

The normal interface remains fully usable without WebMCP.

## Run locally

```powershell
pnpm install
pnpm dev
```

Open the URL printed by Vite in ChatGPT's in-app browser. Site tools are available in the latest ChatGPT desktop app with GPT-5.6 Sol or GPT-5.6 Terra.

## Build and test

```powershell
pnpm check
pnpm build
pnpm preview
```

## Site tools

| Tool | Effect |
|---|---|
| `get_workspace_state` | Reads claim, proposal, note, focus, and review state |
| `list_sources` | Lists source records and stable IDs |
| `search_evidence` | Finds sourced evidence by topic or phrase |
| `focus_evidence` | Selects evidence in the shared canvas |
| `propose_claim_revision` | Adds an unaccepted claim proposal and rationale |
| `leave_review_note` | Adds a visible review instruction |
| `set_source_focus` | Selects a source in the left rail |

Tool descriptions and outputs are kept concise. Read-only and untrusted-content annotations are applied where appropriate. Runtime validation returns actionable recovery guidance.

## Demo prompt

> Use the sources on this page to strengthen the working claim. Keep labor inequality and public health visible, and show me the evidence before anything is accepted.

## Evidence integrity

Visible historical statements are paraphrases from linked institutional sources:

- University of Florida Libraries, Panama Canal Centennial exhibitions on Health and Voices.
- U.S. Department of State Office of the Historian, a retired milestone overview used for foreign-relations context.

The canal graphic is a newly generated teaching schematic and is labeled as such in the interface. It is not presented as an archival artifact.

## Contest-period work

This standalone app, its WebMCP tools, evaluation tests, interface, and documentation were created during the WebMCP Challenge submission period. It draws on Aletheia's pre-existing educational-production ideas, but the submitted implementation is isolated and reproducible in this repository.

## License

MIT. See [LICENSE](LICENSE).
