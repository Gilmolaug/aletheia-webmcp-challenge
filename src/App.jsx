import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  CircleAlert,
  Download,
  FileSearch,
  FileText,
  Filter,
  ExternalLink,
  History,
  Library,
  Menu,
  MessageSquareText,
  PanelRight,
  PencilLine,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  evidence,
  evidenceById,
  initialWorkspace,
  seedActivity,
  sourceById,
  sources,
} from "./data.js";
import { createToolHandlers } from "./toolHandlers.js";
import { registerWebMcpTools, toolDefinitions } from "./webmcp.js";

const STORAGE_KEY = "aletheia-evidence-desk-v2";
const APP_VERSION = 2;
const DEMO_EVIDENCE_IDS = ["labor-conditions", "segregated-rolls", "health-success", "economic-power"];
const DEMO_CLAIM =
  "The Panama Canal was not only an engineering shortcut; it joined public-health innovation and unequal labor systems to a wider expansion of U.S. power.";
const DEMO_RATIONALE =
  "The focused evidence links disease control to construction success, documents segregated labor conditions, and places the canal within U.S. economic and diplomatic power.";
const DEMO_NOTE = "Keep the labor story visible, and distinguish documented evidence from interpretation.";
const DEMO_STEPS = ["Search", "Focus", "Draft", "Qualify", "Handoff"];
const VIEW_HASHES = { desk: "#/desk", sources: "#/sources", review: "#/review" };
const VALID_VIEWS = new Set(Object.keys(VIEW_HASHES));

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function viewFromLocation() {
  const candidate = window.location.hash.replace(/^#\/?/, "");
  return VALID_VIEWS.has(candidate) ? candidate : "desk";
}

function createFreshState() {
  return {
    version: APP_VERSION,
    workspace: structuredClone(initialWorkspace),
    activity: structuredClone(seedActivity),
  };
}

function loadInitialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version === APP_VERSION && saved.workspace && Array.isArray(saved.activity)) return saved;
  } catch {
    // Fall through to the checked seed state.
  }
  return createFreshState();
}

function Header({ activeView, onViewChange, onExport, mobileOpen, setMobileOpen }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" type="button" aria-label="Toggle source rail" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <a className="brand" href={VIEW_HASHES.desk} aria-label="Aletheia evidence desk home" title="Desk home" onClick={() => onViewChange("desk")}>
        <span className="brand-mark">A</span>
        <span className="brand-name">Aletheia</span>
      </a>
      <nav className="primary-nav" aria-label="Workspace views">
        {[
          ["desk", BookOpen, "Desk"],
          ["sources", FileText, "Sources"],
          ["review", ShieldCheck, "Review"],
        ].map(([id, Icon, label]) => (
          <a key={id} href={VIEW_HASHES[id]} className={activeView === id ? "active" : ""} aria-label={`${label} view`} title={`${label} view`} aria-current={activeView === id ? "page" : undefined} onClick={() => onViewChange(id)}>
            <Icon size={18} strokeWidth={1.7} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      <button className="export-button" type="button" aria-label="Export review packet" title="Export review packet" onClick={onExport}>
        <Download size={18} />
        <span>Export review</span>
      </button>
      <div className="avatar" aria-label="Signed in as human reviewer">
        <UserRound size={17} />
        <span>KM</span>
      </div>
    </header>
  );
}

function SourceRail({ selectedSourceId, onSelect, mobileOpen, onRequestSource }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredSources = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return sources;
    return sources.filter((source) => `${source.name} ${source.institution} ${source.summary}`.toLowerCase().includes(clean));
  }, [query]);
  const selectedSource = sourceById.get(selectedSourceId) ?? sources[0];

  return (
    <aside className={`source-rail ${mobileOpen ? "mobile-open" : ""}`} aria-label="Source set">
      <div className="rail-heading">
        <div>
          <span>Source set</span>
          <small>{sources.length} checked references</small>
        </div>
        <button type="button" aria-label="Request another source" title="Request another source" onClick={onRequestSource}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
      {filterOpen ? (
        <div className="source-filter">
          <Search size={15} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter source set" aria-label="Filter source set" autoFocus />
          <button type="button" aria-label="Close source filter" onClick={() => { setFilterOpen(false); setQuery(""); }}><X size={15} /></button>
        </div>
      ) : null}
      <div className="source-list">
        {filteredSources.map((source) => {
          const selected = selectedSourceId === source.id;
          return (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className={`source-row ${selected ? "selected" : ""}`}
              aria-current={selected ? "true" : undefined}
              title={`Open ${source.name}`}
              onClick={() => onSelect(source.id)}
            >
              <span className="source-icon"><Library size={19} strokeWidth={1.6} /></span>
              <span className="source-copy">
                <strong>{source.shortName}</strong>
                <small>{source.institution}</small>
              </span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          );
        })}
        {filteredSources.length === 0 ? <p className="empty-filter">No checked source matches “{query}”.</p> : null}
      </div>
      <a className="source-summary" href={selectedSource.url} target="_blank" rel="noreferrer" title={`Open ${selectedSource.name}`}>
        <FileSearch size={18} />
        <small>{selectedSource.kind}</small>
        <p>{selectedSource.summary}</p>
        <span className="source-link-label">Open source ↗</span>
      </a>
      <button className="filter-button" type="button" aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}>
        <Filter size={16} />
        {filterOpen ? "Hide filter" : "Filter sources"}
      </button>
    </aside>
  );
}

function EvidenceItem({ item, index, focused, selected, onSelect }) {
  const source = sourceById.get(item.sourceId);
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className={`evidence-item ${focused ? "focused" : ""} ${selected ? "active" : ""}`}
      onClick={() => onSelect(item)}
      aria-current={selected ? "true" : undefined}
      title={`Open source: ${source.name}`}
    >
      <span className="evidence-number">{String(index + 1).padStart(2, "0")}</span>
      <span className="evidence-copy">
        <span className="paraphrase">{item.paraphrase}</span>
        <span className="citation-line">
          <span>{source.name}</span>
          <em>{item.locator}</em>
        </span>
      </span>
      <span className="evidence-state" aria-hidden="true">
        {focused ? <CheckCircle2 size={19} /> : <span />}
      </span>
    </a>
  );
}

function DocumentHeading({ eyebrow, title, icon: Icon = FileText }) {
  return (
    <div className="document-heading">
      <Icon size={27} strokeWidth={1.45} />
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
      </div>
    </div>
  );
}

function EvidenceCanvas({ workspace, onEvidenceSelect, activeEvidenceId }) {
  const visibleEvidence = useMemo(() => {
    const focused = workspace.focusedEvidenceIds.map((id) => evidenceById.get(id)).filter(Boolean);
    const remainder = evidence.filter((item) => !workspace.focusedEvidenceIds.includes(item.id));
    return [...focused, ...remainder].slice(0, 4);
  }, [workspace.focusedEvidenceIds]);

  return (
    <main className="evidence-canvas" id="desk">
      <DocumentHeading eyebrow="Evidence brief · Panama Canal" title="The canal changed more than trade" />

      <section className="claim-section" aria-labelledby="working-claim-title">
        <div className="section-title-row">
          <h2 id="working-claim-title">Working claim</h2>
          <PencilLine size={16} />
        </div>
        <div className="claim-row">
          <p className="claim-box">{workspace.claim}</p>
          <aside className="human-note" aria-label="Human review note">
            <MessageSquareText size={16} />
            <strong>{workspace.note}</strong>
            <small>— Human reviewer · Today</small>
          </aside>
        </div>
      </section>

      <section className="evidence-section" aria-labelledby="evidence-title">
        <div className="section-title-row">
          <div>
            <h2 id="evidence-title">Evidence in view</h2>
            <p>Paraphrased from linked institutional sources</p>
          </div>
          <span className="evidence-count">{workspace.focusedEvidenceIds.length} focused</span>
        </div>
        <div className="evidence-list">
          {visibleEvidence.map((item, index) => (
            <EvidenceItem
              key={item.id}
              item={item}
              index={index}
              focused={workspace.focusedEvidenceIds.includes(item.id)}
              selected={activeEvidenceId === item.id}
              onSelect={onEvidenceSelect}
            />
          ))}
        </div>
      </section>

      <figure className="schematic">
        <img src="/assets/panama-canal-schematic.png" alt="Generated educational schematic of a lock canal between two oceans and a raised lake." />
        <figcaption>
          <span>Generated teaching schematic · not an archival artifact</span>
          <span>Ocean → locks → lake → locks → ocean</span>
        </figcaption>
      </figure>
    </main>
  );
}

function SourcesCanvas({ workspace, onSelectSource }) {
  return (
    <main className="evidence-canvas view-canvas" id="sources-view">
      <DocumentHeading eyebrow="Checked evidence set" title="Sources and provenance" icon={Library} />
      <p className="view-intro">Every claim in the demo resolves to a visible institutional source, a human-readable locator, and an explicit trust label.</p>
      <div className="source-catalog">
        {sources.map((source) => {
          const items = evidence.filter((item) => item.sourceId === source.id);
          const selected = workspace.selectedSourceId === source.id;
          return (
            <article className={`source-card ${selected ? "selected" : ""}`} key={source.id}>
              <div className="source-card-heading">
                <span><Library size={18} /></span>
                <div><small>{source.kind}</small><h2><a href={source.url} target="_blank" rel="noreferrer">{source.name}</a></h2></div>
              </div>
              <p>{source.summary}</p>
              <ul>{items.map((item) => <li key={item.id}>{item.locator}</li>)}</ul>
              <div className="source-card-actions">
                <a href={VIEW_HASHES.desk} onClick={() => onSelectSource(source.id)}>{selected ? "Focused in desk" : "Focus in desk"}</a>
                <a href={source.url} target="_blank" rel="noreferrer">Open institution ↗</a>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function ReviewCanvas({ workspace, onReturnToDesk, onExport }) {
  const focusedSources = new Set(workspace.focusedEvidenceIds.map((id) => evidenceById.get(id)?.sourceId).filter(Boolean));
  const accepted = workspace.claim === workspace.suggestion && workspace.reviewStatus.includes("Draft accepted");
  const checks = [
    [workspace.focusedEvidenceIds.length >= 3, `${workspace.focusedEvidenceIds.length} evidence excerpts focused`],
    [focusedSources.size >= 2, `${focusedSources.size} institutions represented`],
    [Boolean(workspace.note), "Human qualification attached"],
    [Boolean(workspace.sourceRequest), workspace.sourceRequest ? "Source gap recorded" : "No source gap recorded"],
    [accepted, accepted ? "Draft accepted by reviewer" : "Human decision still required"],
  ];

  return (
    <main className="evidence-canvas view-canvas" id="review-view">
      <DocumentHeading eyebrow="Human decision record" title="Review readiness" icon={ShieldCheck} />
      <p className="view-intro">The system exposes what the agent changed, what remains interpretive, and which decision still belongs to the reviewer.</p>
      <div className="review-grid">
        <section className="review-card">
          <p className="panel-label">Proposed claim</p>
          <blockquote>{workspace.suggestion}</blockquote>
          <p>{workspace.rationale}</p>
        </section>
        <section className="review-card">
          <p className="panel-label">Readiness checks</p>
          <ul className="readiness-list">
            {checks.map(([complete, label]) => (
              <li key={label} className={complete ? "complete" : "pending"}>
                {complete ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {workspace.sourceRequest ? (
        <section className="source-gap-card">
          <div><Search size={18} /><strong>Open source request · {workspace.sourceRequest.topic}</strong></div>
          <p>{workspace.sourceRequest.question}</p>
        </section>
      ) : null}
      <div className="view-actions">
        <a href={VIEW_HASHES.desk} onClick={onReturnToDesk}><BookOpen size={17} />Return to evidence desk</a>
        <button className="primary-action" type="button" onClick={onExport}><Download size={17} />Export review packet</button>
      </div>
    </main>
  );
}

function WorkspaceCanvas({ activeView, workspace, onEvidenceSelect, activeEvidenceId, onSelectSource, onViewChange, onExport }) {
  if (activeView === "sources") return <SourcesCanvas workspace={workspace} onSelectSource={(sourceId) => { onSelectSource(sourceId); onViewChange("desk"); }} />;
  if (activeView === "review") return <ReviewCanvas workspace={workspace} onReturnToDesk={() => onViewChange("desk")} onExport={onExport} />;
  return <EvidenceCanvas workspace={workspace} onEvidenceSelect={onEvidenceSelect} activeEvidenceId={activeEvidenceId} />;
}

function LiveReviewControl({ status, step, onRun, onReset }) {
  const running = status === "running";
  return (
    <section className={`live-review ${status}`} aria-label="Guided live review">
      <div className="live-review-heading">
        <div><Sparkles size={16} /><strong>Live WebMCP review</strong></div>
        <span>{running ? `Step ${step} of ${DEMO_STEPS.length}` : status === "complete" ? "Handoff ready" : "Ready"}</span>
      </div>
      <p>Run the same handlers exposed to the browser agent, then stop at the human decision boundary.</p>
      <ol className="demo-steps" aria-label="Live review progress">
        {DEMO_STEPS.map((label, index) => (
          <li key={label} className={step > index ? "complete" : step === index + 1 && running ? "current" : ""}>
            <span>{step > index ? <Check size={12} /> : index + 1}</span>{label}
          </li>
        ))}
      </ol>
      <div className="live-review-actions">
        <button type="button" className="demo-action" onClick={onRun} disabled={running}>
          <Play size={16} />{running ? "Review running…" : status === "complete" ? "Run again" : "Start live review"}
        </button>
        <button type="button" className="reset-action" onClick={onReset} disabled={running} title="Reset demo"><RotateCcw size={15} /><span>Reset</span></button>
      </div>
    </section>
  );
}

function AgentWorkspace({ workspace, onAccept, onRequestSource, onLeaveNote, webMcp, demoStatus, demoStep, onRunDemo, onResetDemo }) {
  const accepted = workspace.claim === workspace.suggestion && workspace.reviewStatus.includes("Draft accepted");
  return (
    <aside className="agent-workspace" aria-label="Agent workspace">
      <div className="agent-heading">
        <div>
          <h2>Agent workspace</h2>
          <span className="review-status"><CircleAlert size={15} />{workspace.reviewStatus}</span>
        </div>
        <span className={`site-tools-state ${webMcp.supported ? "supported" : ""}`}>
          <Sparkles size={14} />
          {webMcp.supported ? `${webMcp.count} site tools` : "Human mode"}
        </span>
      </div>

      <LiveReviewControl status={demoStatus} step={demoStep} onRun={onRunDemo} onReset={onResetDemo} />

      <section className="suggestion-block">
        <p className="panel-label">Agent suggestion</p>
        <blockquote>{workspace.suggestion}</blockquote>
        <p className="rationale">{workspace.rationale}</p>
      </section>

      <section className="coverage-block">
        <div className="panel-title-row">
          <p className="panel-label">Source coverage</p>
          <ShieldCheck size={16} />
        </div>
        <div className="coverage-list">
          {sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={`Open ${source.name}`}>
              <Library size={15} />
              <span>{source.shortName}</span>
              <strong>{source.coverage}</strong>
              <CheckCircle2 size={17} />
            </a>
          ))}
        </div>
      </section>

      <section className="agent-actions">
        <p className="panel-label">Human decision</p>
        <button className="primary-action" type="button" onClick={onAccept} disabled={accepted}>
          <Check size={18} />{accepted ? "Accepted as draft" : "Accept as draft"}
        </button>
        <button type="button" onClick={onRequestSource}><Search size={18} />Ask for source</button>
        <button type="button" onClick={onLeaveNote}><PencilLine size={18} />Leave note</button>
        <small>Agent and reviewer are editing the same live page.</small>
      </section>
    </aside>
  );
}

function ActivityStrip({ activity, onViewAll }) {
  return (
    <footer className="activity-strip" aria-label="Recent activity">
      <div className="activity-title"><History size={18} /><strong>Activity</strong></div>
      <div className="activity-items">
        {activity.slice(0, 3).map((entry) => (
          <div className="activity-item" key={entry.id}>
            <span className={`agent-dot ${entry.actor === "Human" ? "human" : ""}`}>{entry.actor === "Human" ? "KM" : "AI"}</span>
            <span className="activity-time">{entry.time}</span>
            <span className="activity-copy"><strong>{entry.tool}</strong><small>{entry.summary}</small></span>
          </div>
        ))}
      </div>
      <button type="button" onClick={onViewAll}><PanelRight size={17} />View all</button>
    </footer>
  );
}

function DialogShell({ title, eyebrow, onClose, children, actions, wide = false }) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className={`dialog-card ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header>
          <div><small>{eyebrow}</small><h2 id="dialog-title">{title}</h2></div>
          <button type="button" aria-label={`Close ${title}`} onClick={onClose}><X size={19} /></button>
        </header>
        <div className="dialog-body">{children}</div>
        {actions ? <footer>{actions}</footer> : null}
      </section>
    </div>
  );
}

function NoteDialog({ initialValue, onClose, onSave }) {
  const [value, setValue] = useState(initialValue);
  return (
    <DialogShell
      title="Leave a review note"
      eyebrow="Human instruction"
      onClose={onClose}
      actions={<><button type="button" onClick={onClose}>Cancel</button><button type="button" className="primary-action" disabled={!value.trim()} onClick={() => onSave(value)}>Save note</button></>}
    >
      <label htmlFor="review-note">What should the agent or next reviewer preserve, qualify, or verify?</label>
      <textarea id="review-note" value={value} onChange={(event) => setValue(event.target.value.slice(0, 240))} rows={5} autoFocus />
      <small>{value.length} / 240</small>
    </DialogShell>
  );
}

function SourceRequestDialog({ onClose, onSubmit }) {
  const [topic, setTopic] = useState("Panamanian perspectives");
  const [question, setQuestion] = useState("Add a source that centers Panamanian or Caribbean perspectives on labor and sovereignty.");
  return (
    <DialogShell
      title="Request another source"
      eyebrow="Evidence gap"
      onClose={onClose}
      actions={<><button type="button" onClick={onClose}>Cancel</button><button type="button" className="primary-action" disabled={!question.trim()} onClick={() => onSubmit({ topic, question })}>Add request</button></>}
    >
      <label htmlFor="source-topic">Topic</label>
      <select id="source-topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
        <option>Panamanian perspectives</option>
        <option>Caribbean labor history</option>
        <option>Public-health context</option>
        <option>U.S.–Panama relations</option>
      </select>
      <label htmlFor="source-question">Research request</label>
      <textarea id="source-question" value={question} onChange={(event) => setQuestion(event.target.value.slice(0, 320))} rows={5} autoFocus />
      <p className="dialog-help">This creates a visible research task; it does not invent or silently attach a source.</p>
    </DialogShell>
  );
}

function ActivityDialog({ activity, onClose }) {
  return (
    <DialogShell title="Review activity" eyebrow="Shared audit trail" onClose={onClose} wide>
      <div className="activity-log">
        {activity.map((entry) => (
          <article key={entry.id}>
            <span className={`agent-dot ${entry.actor === "Human" ? "human" : ""}`}>{entry.actor === "Human" ? "KM" : "AI"}</span>
            <div><strong>{entry.tool}</strong><p>{entry.summary}</p></div>
            <time>{entry.time}</time>
          </article>
        ))}
      </div>
    </DialogShell>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast" role="status"><CheckCircle2 size={17} />{message}</div>;
}

export default function App() {
  const [state, setState] = useState(loadInitialState);
  const [activeView, setActiveView] = useState(viewFromLocation);
  const [activeEvidenceId, setActiveEvidenceId] = useState(state.workspace.focusedEvidenceIds[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [webMcp, setWebMcp] = useState({ supported: false, count: 0, names: [] });
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [demoStatus, setDemoStatus] = useState("idle");
  const [demoStep, setDemoStep] = useState(0);
  const latestStateRef = useRef(state);
  const handlersRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    latestStateRef.current = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2800);
  }, []);

  const addActivity = useCallback((tool, summary, actor = "Agent") => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setState((previous) => ({
      ...previous,
      activity: [
        { id: `${tool}-${now.getTime()}`, actor, time, tool, summary },
        ...previous.activity,
      ].slice(0, 16),
    }));
    showToast(summary);
  }, [showToast]);

  useEffect(() => {
    let cleanup = () => {};
    const handlers = createToolHandlers({
      getState: () => latestStateRef.current,
      updateState: setState,
      addActivity,
    });
    handlersRef.current = handlers;

    registerWebMcpTools(handlers)
      .then((result) => {
        cleanup = result.cleanup;
        setWebMcp({ supported: result.supported, count: result.count, names: result.names });
      })
      .catch((error) => {
        setWebMcp({ supported: false, count: 0, names: [], error: error.message });
      });

    return () => {
      handlersRef.current = null;
      cleanup();
    };
  }, [addActivity]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  useEffect(() => {
    const syncViewToLocation = () => {
      const nextView = viewFromLocation();
      if (window.location.hash !== VIEW_HASHES[nextView]) {
        window.history.replaceState(null, "", VIEW_HASHES[nextView]);
      }
      setActiveView(nextView);
    };
    syncViewToLocation();
    window.addEventListener("hashchange", syncViewToLocation);
    return () => window.removeEventListener("hashchange", syncViewToLocation);
  }, []);

  const switchView = useCallback((view) => {
    const nextView = VALID_VIEWS.has(view) ? view : "desk";
    if (window.location.hash !== VIEW_HASHES[nextView]) window.location.hash = VIEW_HASHES[nextView];
    setActiveView(nextView);
    setMobileOpen(false);
  }, []);

  const selectSource = useCallback((sourceId) => {
    setState((previous) => ({
      ...previous,
      workspace: { ...previous.workspace, selectedSourceId: sourceId },
    }));
    setMobileOpen(false);
  }, []);

  const selectEvidence = useCallback((item) => {
    setActiveEvidenceId(item.id);
    selectSource(item.sourceId);
    showToast(`Focused evidence from ${sourceById.get(item.sourceId).shortName}.`);
  }, [selectSource, showToast]);

  const acceptDraft = useCallback(() => {
    setState((previous) => ({
      ...previous,
      workspace: {
        ...previous.workspace,
        claim: previous.workspace.suggestion,
        reviewStatus: "Draft accepted · source review open",
      },
    }));
    addActivity("human_review", "Accepted the agent proposal as a draft; source review remains open.", "Human");
  }, [addActivity]);

  const saveHumanNote = useCallback((note) => {
    const clean = note.trim().slice(0, 240);
    if (!clean) return;
    setState((previous) => ({
      ...previous,
      workspace: { ...previous.workspace, note: clean, reviewStatus: "Needs human review" },
    }));
    setNoteDialogOpen(false);
    addActivity("human_review_note", "Updated the visible qualification on the working claim.", "Human");
  }, [addActivity]);

  const submitSourceRequest = useCallback(({ topic, question }) => {
    handlersRef.current?.request_additional_source({ topic, question });
    setSourceDialogOpen(false);
    switchView("review");
  }, [switchView]);

  const runLiveReview = useCallback(async () => {
    if (!handlersRef.current || demoStatus === "running") return;
    setDemoStatus("running");
    setDemoStep(1);
    switchView("desk");
    try {
      handlersRef.current.search_evidence({ query: "labor inequality public health political power" });
      await wait(520);
      setDemoStep(2);
      handlersRef.current.focus_evidence({ evidenceIds: DEMO_EVIDENCE_IDS });
      setActiveEvidenceId(DEMO_EVIDENCE_IDS[0]);
      await wait(620);
      setDemoStep(3);
      handlersRef.current.propose_claim_revision({ claim: DEMO_CLAIM, rationale: DEMO_RATIONALE });
      await wait(620);
      setDemoStep(4);
      handlersRef.current.leave_review_note({ note: DEMO_NOTE });
      await wait(520);
      setDemoStep(5);
      handlersRef.current.set_source_focus({ sourceId: "uf-voices" });
      await wait(520);
      setDemoStatus("complete");
      showToast("Live review complete. The human decision is ready.");
    } catch (error) {
      setDemoStatus("idle");
      setDemoStep(0);
      showToast(`Review stopped: ${error.message}`);
    }
  }, [demoStatus, showToast, switchView]);

  const resetDemo = useCallback(() => {
    const fresh = createFreshState();
    latestStateRef.current = fresh;
    setState(fresh);
    setActiveView("desk");
    setActiveEvidenceId(fresh.workspace.focusedEvidenceIds[0]);
    setDemoStatus("idle");
    setDemoStep(0);
    showToast("Demo reset to the initial human-review state.");
  }, [showToast]);

  const exportReview = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      title: "The canal changed more than trade",
      webMcpTools: toolDefinitions.map(({ name, title }) => ({ name, title })),
      workspace: state.workspace,
      evidence: state.workspace.focusedEvidenceIds.map((id) => evidenceById.get(id)),
      sources,
      activity: state.activity,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aletheia-live-review.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addActivity("export_review_packet", "Exported the evidence, sources, tool manifest, decisions, and activity trail.", "Human");
  }, [addActivity, state.activity, state.workspace]);

  return (
    <div className="app-shell">
      <Header
        activeView={activeView}
        onViewChange={switchView}
        onExport={exportReview}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="workspace-grid">
        <SourceRail selectedSourceId={state.workspace.selectedSourceId} onSelect={selectSource} mobileOpen={mobileOpen} onRequestSource={() => setSourceDialogOpen(true)} />
        <WorkspaceCanvas
          activeView={activeView}
          workspace={state.workspace}
          onEvidenceSelect={selectEvidence}
          activeEvidenceId={activeEvidenceId}
          onSelectSource={selectSource}
          onViewChange={switchView}
          onExport={exportReview}
        />
        <AgentWorkspace
          workspace={state.workspace}
          onAccept={acceptDraft}
          onRequestSource={() => setSourceDialogOpen(true)}
          onLeaveNote={() => setNoteDialogOpen(true)}
          webMcp={webMcp}
          demoStatus={demoStatus}
          demoStep={demoStep}
          onRunDemo={runLiveReview}
          onResetDemo={resetDemo}
        />
      </div>
      <ActivityStrip activity={state.activity} onViewAll={() => setActivityOpen(true)} />
      {noteDialogOpen ? <NoteDialog initialValue={state.workspace.note} onClose={() => setNoteDialogOpen(false)} onSave={saveHumanNote} /> : null}
      {sourceDialogOpen ? <SourceRequestDialog onClose={() => setSourceDialogOpen(false)} onSubmit={submitSourceRequest} /> : null}
      {activityOpen ? <ActivityDialog activity={state.activity} onClose={() => setActivityOpen(false)} /> : null}
      <Toast message={toast} />
      <span className="visually-hidden" data-tool-count={toolDefinitions.length}>
        {webMcp.supported ? "WebMCP tools registered" : "WebMCP unavailable; human interface remains functional"}
      </span>
    </div>
  );
}
