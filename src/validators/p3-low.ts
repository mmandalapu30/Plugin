import { ValidationIssue, NodeSnapshot } from "../types";
import rules from "../config/rules.json";

/**
 * P3 — Low-priority / informational validators.
 *
 * STUB LOGIC: Replace the bodies with accessibility / traceability checks.
 */

// ─── P3-1: Accessibility (contrast re-check) ──────────────────────────────
export function validateAccessibility(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Reuse contrast stub: flag if no fill present
  if (!node.fills || node.fills.length === 0) {
    issues.push({
      id: "P3_ACCESSIBILITY",
      severity: "P3",
      title: "Accessibility: Fill Missing",
      message: `Node "${node.name}" has no fill colour defined. Screen readers and accessibility tools may not render this correctly.`,
      suggestion:
        "Define an explicit fill and verify text contrast meets WCAG 2.1 AA (4.5:1 for normal text).",
    });
  }

  return issues;
}

// ─── P3-2: Naming consistency ─────────────────────────────────────────────
export function validateConsistency(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const keywords: string[] = (
    rules.p3 as { consistencyKeywords: string[] }
  ).consistencyKeywords;

  const nameLower = node.name.toLowerCase();
  const matchedKeyword = keywords.find((kw) => nameLower.includes(kw));

  if (!matchedKeyword) {
    issues.push({
      id: "P3_CONSISTENCY",
      severity: "P3",
      title: "Non-Standard Node Name",
      message: `Node "${node.name}" does not include a recognised design-system keyword.`,
      suggestion: `Prefix or include one of: ${keywords.join(", ")} for design-system traceability.`,
    });
  }

  return issues;
}

// ─── P3-3: Traceability / plugin metadata ─────────────────────────────────
export function validateTraceability(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!node.hasPluginData) {
    issues.push({
      id: "P3_TRACEABILITY",
      severity: "P3",
      title: "No Plugin Metadata",
      message: `Node "${node.name}" has no shared plugin data attached.`,
      suggestion:
        "Attach compliance metadata (e.g. rule version, approval status) via plugin data for audit traceability.",
    });
  }

  return issues;
}

// ─── Aggregate P3 runner ──────────────────────────────────────────────────
export function validateP3(node: NodeSnapshot): ValidationIssue[] {
  return [
    ...validateAccessibility(node),
    ...validateConsistency(node),
    ...validateTraceability(node),
  ];
}
