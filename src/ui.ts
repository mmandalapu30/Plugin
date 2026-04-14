/**
 * ui.ts — UI thread logic.
 *
 * This file runs inside the browser iframe (has full DOM access).
 * It communicates with the plugin sandbox via parent.postMessage.
 */

import { MessageToPlugin, ValidationResult, ValidationIssue } from "./types";

// ─── Message helpers ──────────────────────────────────────────────────────

function sendToPlugin(msg: MessageToPlugin): void {
  parent.postMessage({ pluginMessage: msg }, "*");
}

// ─── DOM helpers ──────────────────────────────────────────────────────────

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Element #${id} not found`);
  return node as T;
}

// ─── Render: Compliance Score ─────────────────────────────────────────────

function renderScore(score: number): void {
  const scoreNumber = el<HTMLElement>("score-number");
  const scoreLabel = el<HTMLElement>("score-label");
  const scoreRing = document.getElementById("score-ring-fill") as SVGCircleElement | null;
  const scoreCard = el<HTMLElement>("score-card");

  scoreNumber.textContent = `${score}%`;

  // Colour-code the score
  scoreCard.classList.remove("score-red", "score-yellow", "score-green");
  if (score < 50) {
    scoreCard.classList.add("score-red");
    scoreLabel.textContent = "Non-Compliant";
  } else if (score < 80) {
    scoreCard.classList.add("score-yellow");
    scoreLabel.textContent = "Partially Compliant";
  } else {
    scoreCard.classList.add("score-green");
    scoreLabel.textContent = "Compliant";
  }

  // Animate the SVG ring
  const circumference = 2 * Math.PI * 54; // r=54
  const offset = circumference - (score / 100) * circumference;
  if (scoreRing) {
    scoreRing.style.strokeDasharray = `${circumference}`;
    scoreRing.style.strokeDashoffset = `${offset}`;
  }
}

// ─── Render: Issue card ───────────────────────────────────────────────────

function createIssueCard(issue: ValidationIssue): HTMLElement {
  const card = document.createElement("div");
  card.className = `issue-card issue-${issue.severity.toLowerCase()}`;

  card.innerHTML = `
    <div class="issue-header">
      <span class="issue-badge badge-${issue.severity.toLowerCase()}">${issue.severity}</span>
      <span class="issue-title">${escapeHtml(issue.title)}</span>
    </div>
    <p class="issue-message">${escapeHtml(issue.message)}</p>
    <div class="issue-suggestion">
      <span class="suggestion-icon">💡</span>
      <span>${escapeHtml(issue.suggestion)}</span>
    </div>
  `;

  return card;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Render: Issues panel ─────────────────────────────────────────────────

type SeverityKey = "P0" | "P1" | "P2" | "P3";

function renderIssues(issues: ValidationIssue[]): void {
  const panels: Record<SeverityKey, HTMLElement> = {
    P0: el("issues-p0"),
    P1: el("issues-p1"),
    P2: el("issues-p2"),
    P3: el("issues-p3"),
  };
  // Both the score breakdown chips and the section header badges
  const countEls = (sev: SeverityKey) => {
    const els: HTMLElement[] = [];
    const chip = document.getElementById(`count-${sev.toLowerCase()}`);
    const badge = document.getElementById(`badge-count-${sev.toLowerCase()}`);
    if (chip) els.push(chip);
    if (badge) els.push(badge);
    return els;
  };

  // Clear
  (["P0", "P1", "P2", "P3"] as SeverityKey[]).forEach((s) => {
    panels[s].innerHTML = "";
    countEls(s).forEach((el) => { el.textContent = "0"; });
  });

  if (issues.length === 0) {
    (["P0", "P1", "P2", "P3"] as SeverityKey[]).forEach((s) => {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No issues found ✓";
      panels[s].appendChild(empty);
    });
    return;
  }

  const grouped: Record<SeverityKey, ValidationIssue[]> = { P0: [], P1: [], P2: [], P3: [] };
  issues.forEach((issue) => {
    if (issue.severity in grouped) {
      grouped[issue.severity as SeverityKey].push(issue);
    }
  });

  (["P0", "P1", "P2", "P3"] as SeverityKey[]).forEach((s) => {
    const list = grouped[s];
    countEls(s).forEach((el) => { el.textContent = String(list.length); });
    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No issues found ✓";
      panels[s].appendChild(empty);
    } else {
      list.forEach((issue) => panels[s].appendChild(createIssueCard(issue)));
    }
  });
}

// ─── Render: Element Details ──────────────────────────────────────────────

interface NodeSnapshot {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  depth: number;
  childCount: number;
  fills: ReadonlyArray<{ type: string }>;
  fontSize?: number;
  hasVariants: boolean;
  hasPluginData: boolean;
}

function renderDetails(snapshot?: NodeSnapshot): void {
  el("detail-name").textContent = snapshot?.name ?? "—";
  el("detail-type").textContent = snapshot?.type ?? "—";
  el("detail-size").textContent =
    snapshot ? `${Math.round(snapshot.width)} × ${Math.round(snapshot.height)} px` : "—";
  el("detail-fill").textContent =
    snapshot?.fills && snapshot.fills.length > 0 ? snapshot.fills[0].type : "None";
  el("detail-depth").textContent = snapshot !== undefined ? String(snapshot.depth) : "—";
  el("detail-children").textContent =
    snapshot !== undefined ? String(snapshot.childCount) : "—";
}

// ─── Render: Timestamp ────────────────────────────────────────────────────

function renderTimestamp(ts: string): void {
  const d = new Date(ts);
  el("last-updated").textContent = `Last run: ${d.toLocaleTimeString()}`;
}

// ─── State: loading / empty ───────────────────────────────────────────────

function showState(state: "empty" | "loading" | "results"): void {
  el("state-empty").style.display = state === "empty" ? "flex" : "none";
  el("state-loading").style.display = state === "loading" ? "flex" : "none";
  el("state-results").style.display = state === "results" ? "block" : "none";
}

// ─── Message handler ──────────────────────────────────────────────────────

interface ExtendedMessage {
  type: string;
  payload?: ValidationResult;
  snapshot?: NodeSnapshot;
}

window.onmessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage as ExtendedMessage | undefined;
  if (!msg) return;

  switch (msg.type) {
    case "LOADING":
      showState("loading");
      break;

    case "SELECTION_CLEARED":
      showState("empty");
      renderDetails(undefined);
      break;

    case "VALIDATION_RESULT":
      if (msg.payload) {
        showState("results");
        renderScore(msg.payload.score);
        renderIssues(msg.payload.issues);
        renderTimestamp(msg.payload.timestamp);
      }
      if (msg.snapshot) {
        renderDetails(msg.snapshot);
      }
      break;

    default:
      break;
  }
};

// ─── Button handlers ──────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  el("btn-run").addEventListener("click", () => {
    sendToPlugin({ type: "RUN_VALIDATION" });
  });

  el("btn-refresh").addEventListener("click", () => {
    sendToPlugin({ type: "REFRESH_SELECTION" });
  });

  // Accordion toggles for severity sections
  document.querySelectorAll(".section-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = (btn as HTMLElement).dataset.target;
      if (!target) return;
      const panel = document.getElementById(target);
      if (!panel) return;
      panel.classList.toggle("collapsed");
      btn.classList.toggle("open");
    });
  });
});
