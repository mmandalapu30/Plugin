// ─── Severity Levels ───────────────────────────────────────────────────────

export type Severity = "P0" | "P1" | "P2" | "P3";

// ─── Validation Issue ──────────────────────────────────────────────────────

export interface ValidationIssue {
  /** Unique rule identifier, e.g. "P0_ICON_NAME" */
  id: string;
  severity: Severity;
  /** Short human-readable title, e.g. "Icon Name Invalid" */
  title: string;
  /** Longer description of the problem found */
  message: string;
  /** Actionable recommendation */
  suggestion: string;
}

// ─── Validation Result ─────────────────────────────────────────────────────

export interface ValidationResult {
  /** 0–100 compliance score */
  score: number;
  issues: ValidationIssue[];
  /** ISO timestamp of when validation ran */
  timestamp: string;
}

// ─── Node Snapshot (serialisable subset of Figma SceneNode) ───────────────

export interface NodeSnapshot {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  /** Depth from the page root (0 = direct child of page) */
  depth: number;
  /** Number of direct children */
  childCount: number;
  fills: ReadonlyArray<Paint>;
  fontSize?: number;
  /** Whether the node has component variants */
  hasVariants: boolean;
  /** Whether the node has shared plugin data (metadata) */
  hasPluginData: boolean;
}

// ─── Message shapes sent between plugin code ↔ UI ─────────────────────────

export interface MessageToUI {
  type: "VALIDATION_RESULT" | "SELECTION_CLEARED" | "LOADING";
  payload?: ValidationResult | NodeSnapshot;
}

export interface MessageToPlugin {
  type: "RUN_VALIDATION" | "REFRESH_SELECTION";
}
