# Demo video script (target: 2:45)

## Recording setup

- Use the public GitHub Pages URL in the latest ChatGPT desktop app with GPT-5.6 Sol or GPT-5.6 Terra.
- Keep the browser, ChatGPT conversation, and mouse pointer readable at 1080p.
- Record live narration; the contest requires audio.
- Reset the prototype immediately before recording.

## 0:00-0:18 — The problem

**Narration:** “Research agents are fast, but their work is often separated from the page where a person checks sources and makes decisions. Aletheia Evidence Desk turns the open webpage into a shared evidence workspace.”

**On screen:** Open the Desk view. Point to the working claim, evidence in view, agent workspace, and human-review label.

## 0:18-0:38 — Provenance and the normal interface

**Narration:** “The normal interface works without an agent. Every source row and evidence excerpt links directly to checked institutional material, and Desk, Sources, and Review are real browser routes.”

**On screen:** Open one source link in a new tab, return, then visit Sources and Review and return to Desk.

## 0:38-0:55 — The live WebMCP request

**Narration:** “Now I will ask ChatGPT to work with the live page instead of describing the page back and forth.”

**Prompt to paste:**

> Use the sources on this page to strengthen the working claim. Keep labor inequality and public health visible, show me the evidence before anything is accepted, and flag any missing perspective.

## 0:55-1:42 — Agent action in shared state

**Narration:** “Aletheia exposes eight typed WebMCP tools. The agent reads the workspace, searches only the checked evidence, focuses relevant excerpts, selects sources, proposes a revision, leaves a review note, and can request missing evidence.”

**On screen:** Let the agent call `get_workspace_state`, `search_evidence`, `focus_evidence`, `set_source_focus`, `propose_claim_revision`, `leave_review_note`, and, if appropriate, `request_additional_source`. Show the page updating after the calls.

## 1:42-2:12 — Human decision boundary

**Narration:** “The agent cannot silently promote its own proposal. The new wording is clearly marked as a suggestion, the supporting evidence stays visible, and acceptance remains a human action.”

**On screen:** Compare the working claim with the proposal. Inspect the focused evidence and review note. Choose **Accept as draft** only after showing the boundary.

## 2:12-2:32 — Auditability

**Narration:** “The Review view preserves the tool manifest, evidence coverage, decisions, and activity trail. The reviewer can also request another source instead of allowing the agent to invent one.”

**On screen:** Open Review, show the eight-tool manifest and source request, then export the JSON review packet.

## 2:32-2:45 — Close

**Narration:** “WebMCP makes this possible because the agent and the person share the page’s real state and actions. Aletheia turns AI-assisted research into a visible, source-backed collaboration.”

**On screen:** End on the Desk with the accepted draft, focused evidence, and activity trail visible.

## Pre-upload checklist

- Final duration is under 3:00.
- Voice is audible and screen text is readable.
- The WebMCP calls are visible in the ChatGPT interaction.
- The public URL appears on screen.
- The uploaded YouTube video is public (or unlisted if the contest explicitly permits it) and accessible without sign-in.
