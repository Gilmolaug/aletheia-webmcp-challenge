import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileSearch,
  FileText,
  History,
  Library,
  Menu,
  MessageSquareText,
  PanelRight,
  PencilLine,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
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

const STORAGE_KEY = "aletheia-evidence-desk-v1";

function loadInitialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version === 1 && saved.workspace && Array.isArray(saved.activity)) return saved;
  } catch {
    // Fall through to the checked seed state.
  }
  return { version: 1, workspace: initialWorkspace, activity: seedActivity };
}

function Header({ activeView, setActiveView, onExport, mobileOpen, setMobileOpen }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" type="button" aria-label="Toggle source rail" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <a className="brand" href="#desk" aria-label="Aletheia evidence desk home">
        <span className="brand-mark">A</span>
        <span className="brand-name">Aletheia</span>
      </a>
      <nav className="primary-nav" aria-label="Workspace views">
        {[
          ["desk", BookOpen, "Desk"],
          ["sources", FileText, "Sources"],
          ["review", ShieldCheck, "Review"],
        ].map(([id, Icon, label]) => (
          <button key={id} type="button" className={activeView === id ? "active" : ""} onClick={() => setActiveView(id)}>
            <Icon size={18} strokeWidth={1.7} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <button className="export-button" type="button" onClick={onExport}>
        <Upload size={18} />
        Export lesson
      </button>
      <div className="avatar" aria-label="Signed in as human reviewer">
        <UserRound size={17} />
        <span>KM</span>
      </div>
    </header>
  );
}

function SourceRail({ selectedSourceId, onSelect, mobileOpen }) {
  return (
    <aside className={`source-rail ${mobileOpen ? "mobile-open" : ""}`} aria-label="Source set">
      <div className="rail-heading">
        <div>
          <span>Source set</span>
          <small>3 checked references</small>
        </div>
        <button type="button" aria-label="Add source" title="Add source"><span aria-hidden="true">+</span></button>
      </div>
      <div className="source-list">
        {sources.map((source) => {
          const selected = selectedSourceId === source.id;
          return (
            <button key={source.id} type="button" className={`source-row ${selected ? "selected" : ""}`} onClick={() => onSelect(source.id)}>
              <span className="source-icon"><Library size={19} strokeWidth={1.6} /></span>
              <span className="source-copy">
                <strong>{source.shortName}</strong>
                <small>{source.institution}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          );
        })}
      </div>
      <div className="source-summary">
        <FileSearch size={18} />
        <small>{sourceById.get(selectedSourceId)?.kind}</small>
        <p>{sourceById.get(selectedSourceId)?.summary}</p>
        <a href={sourceById.get(selectedSourceId)?.url} target="_blank" rel="noreferrer">Open source</a>
      </div>
      <button className="filter-button" type="button">
        <Search size={16} />
        Filter sources
      </button>
    </aside>
  );
}

function EvidenceItem({ item, index, focused, selected, onSelect }) {
  const source = sourceById.get(item.sourceId);
  return (
    <button
      type="button"
      className={`evidence-item ${focused ? "focused" : ""} ${selected ? "active" : ""}`}
      onClick={() => onSelect(item)}
      aria-pressed={selected}
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
    </button>
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
      <div className="document-heading">
        <FileText size={27} strokeWidth={1.45} />
        <div>
          <p>Evidence brief · Panama Canal</p>
          <h1>The canal changed more than trade</h1>
        </div>
      </div>

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

function AgentWorkspace({ workspace, onAccept, onRequestSource, onLeaveNote, webMcp }) {
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
            <div key={source.id}>
              <Library size={15} />
              <span>{source.shortName}</span>
              <strong>{source.coverage}</strong>
              <CheckCircle2 size={17} />
            </div>
          ))}
        </div>
      </section>

      <section className="agent-actions">
        <p className="panel-label">Human decision</p>
        <button className="primary-action" type="button" onClick={onAccept}><Check size={18} />Accept as draft</button>
        <button type="button" onClick={onRequestSource}><Search size={18} />Ask for source</button>
        <button type="button" onClick={onLeaveNote}><PencilLine size={18} />Leave note</button>
        <small>Agent and reviewer are editing the same live page.</small>
      </section>
    </aside>
  );
}

function ActivityStrip({ activity }) {
  return (
    <footer className="activity-strip" aria-label="Recent activity">
      <div className="activity-title"><History size={18} /><strong>Activity</strong></div>
      <div className="activity-items">
        {activity.slice(0, 3).map((entry) => (
          <div className="activity-item" key={entry.id}>
            <span className="agent-dot">AI</span>
            <span className="activity-time">{entry.time}</span>
            <span className="activity-copy"><strong>{entry.tool}</strong><small>{entry.summary}</small></span>
          </div>
        ))}
      </div>
      <button type="button"><PanelRight size={17} />View all</button>
    </footer>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast" role="status"><CheckCircle2 size={17} />{message}</div>;
}

export default function App() {
  const [state, setState] = useState(loadInitialState);
  const [activeView, setActiveView] = useState("desk");
  const [activeEvidenceId, setActiveEvidenceId] = useState(state.workspace.focusedEvidenceIds[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [webMcp, setWebMcp] = useState({ supported: false, count: 0, names: [] });
  const latestStateRef = useRef(state);
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

  const addActivity = useCallback((tool, summary) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setState((previous) => ({
      ...previous,
      activity: [
        { id: `${tool}-${now.getTime()}`, actor: "Agent", time, tool, summary },
        ...previous.activity,
      ].slice(0, 8),
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

    registerWebMcpTools(handlers)
      .then((result) => {
        cleanup = result.cleanup;
        setWebMcp({ supported: result.supported, count: result.count, names: result.names });
      })
      .catch((error) => {
        setWebMcp({ supported: false, count: 0, names: [], error: error.message });
      });

    return () => cleanup();
  }, [addActivity]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

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
  }, [selectSource]);

  const acceptDraft = useCallback(() => {
    setState((previous) => ({
      ...previous,
      workspace: {
        ...previous.workspace,
        claim: previous.workspace.suggestion,
        reviewStatus: "Draft accepted · source review open",
      },
      activity: [
        {
          id: `human-${Date.now()}`,
          actor: "Human",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tool: "human_review",
          summary: "Accepted the agent proposal as a draft; source review remains open.",
        },
        ...previous.activity,
      ],
    }));
    showToast("Proposal accepted as a draft; source review remains open.");
  }, [showToast]);

  const requestSource = useCallback(() => {
    showToast("Source request is ready for the browser agent.");
  }, [showToast]);

  const leaveHumanNote = useCallback(() => {
    const note = window.prompt("Leave a short instruction for the agent and reviewer:", state.workspace.note);
    if (!note?.trim()) return;
    setState((previous) => ({
      ...previous,
      workspace: { ...previous.workspace, note: note.trim().slice(0, 240), reviewStatus: "Needs human review" },
    }));
    showToast("Human note updated on the shared claim.");
  }, [showToast, state.workspace.note]);

  const exportLesson = useCallback(() => {
    const payload = {
      title: "The canal changed more than trade",
      ...state.workspace,
      evidence: state.workspace.focusedEvidenceIds.map((id) => evidenceById.get(id)),
      sources,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aletheia-evidence-lesson.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Lesson package exported.");
  }, [showToast, state.workspace]);

  return (
    <div className="app-shell">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onExport={exportLesson}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="workspace-grid">
        <SourceRail selectedSourceId={state.workspace.selectedSourceId} onSelect={selectSource} mobileOpen={mobileOpen} />
        <EvidenceCanvas workspace={state.workspace} onEvidenceSelect={selectEvidence} activeEvidenceId={activeEvidenceId} />
        <AgentWorkspace
          workspace={state.workspace}
          onAccept={acceptDraft}
          onRequestSource={requestSource}
          onLeaveNote={leaveHumanNote}
          webMcp={webMcp}
        />
      </div>
      <ActivityStrip activity={state.activity} />
      <Toast message={toast} />
      <span className="visually-hidden" data-tool-count={toolDefinitions.length}>
        {webMcp.supported ? "WebMCP tools registered" : "WebMCP unavailable; human interface remains functional"}
      </span>
    </div>
  );
}
