import { ValidationIssue, NodeSnapshot } from "../types";
import rules from "../config/rules.json";

/**
 * P0 — Critical validators.
 * Each function returns an array of issues (empty = pass).
 *
 * STUB LOGIC: Replace the bodies with real ISO / Android-Auto rule checks
 * without changing the function signatures.
 */

// ─── P0-1: Icon name validation ───────────────────────────────────────────
export function validateIconName(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const keyword: string = (rules.p0 as { iconNameKeyword: string }).iconNameKeyword;

  if (
    node.type === "COMPONENT" ||
    node.type === "INSTANCE" ||
    node.name.toLowerCase().includes("icon")
  ) {
    // Node is intended to be an icon — check the naming convention
    if (!node.name.toLowerCase().includes(keyword)) {
      issues.push({
        id: "P0_ICON_NAME",
        severity: "P0",
        title: "Icon Name Invalid",
        message: `Node "${node.name}" does not follow the icon naming convention. Expected name to include "${keyword}".`,
        suggestion: `Rename the node to include "${keyword}", e.g. "icon_arrow_right".`,
      });
    }
  }

  return issues;
}

// ─── P0-2: Color / fill validation ────────────────────────────────────────
export function validateColor(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allowedTypes: string[] = (
    rules.p0 as { allowedFillTypes: string[] }
  ).allowedFillTypes;

  if (node.fills && node.fills.length > 0) {
    for (const fill of node.fills) {
      if (fill.type && !allowedTypes.includes(fill.type)) {
        issues.push({
          id: "P0_COLOR_FILL",
          severity: "P0",
          title: "Non-Standard Fill Type",
          message: `Node "${node.name}" uses fill type "${fill.type}" which is not in the approved list.`,
          suggestion: `Use one of the approved fill types: ${allowedTypes.join(", ")}.`,
        });
        break; // Report once per node
      }
    }
  }

  return issues;
}

// ─── P0-3: Contrast / background validation ───────────────────────────────
export function validateContrast(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // STUB: flag nodes that have no fills at all (no background defined)
  if (!node.fills || node.fills.length === 0) {
    issues.push({
      id: "P0_CONTRAST",
      severity: "P0",
      title: "Missing Background / Fill",
      message: `Node "${node.name}" has no fill. Contrast cannot be evaluated without a defined background.`,
      suggestion:
        "Add a background fill and ensure a minimum contrast ratio of 4.5:1 per WCAG AA.",
    });
  }

  return issues;
}

// ─── P0-4: Distraction / complexity validation ────────────────────────────
export function validateDistraction(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const maxChildren: number = (rules.p0 as { maxChildNodes: number }).maxChildNodes;

  if (node.childCount > maxChildren) {
    issues.push({
      id: "P0_DISTRACTION",
      severity: "P0",
      title: "Excessive Child Elements",
      message: `Node "${node.name}" has ${node.childCount} children (max allowed: ${maxChildren}). Overly complex UI elements are a distraction risk.`,
      suggestion: `Simplify the component to have at most ${maxChildren} direct children. Consider grouping related elements.`,
    });
  }

  return issues;
}

// ─── Aggregate P0 runner ──────────────────────────────────────────────────
export function validateP0(node: NodeSnapshot): ValidationIssue[] {
  return [
    ...validateIconName(node),
    ...validateColor(node),
    ...validateContrast(node),
    ...validateDistraction(node),
  ];
}
