import { ValidationIssue, NodeSnapshot } from "../types";
import rules from "../config/rules.json";

/**
 * P1 — High-priority validators.
 *
 * STUB LOGIC: Replace the bodies with real automotive UX rule checks.
 */

// ─── P1-1: Touch / tap target size ────────────────────────────────────────
export function validateTouchSize(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const minSize: number = (rules.p1 as { minTouchSizePx: number }).minTouchSizePx;

  if (node.width < minSize || node.height < minSize) {
    issues.push({
      id: "P1_TOUCH_SIZE",
      severity: "P1",
      title: "Touch Target Too Small",
      message: `Node "${node.name}" is ${node.width}×${node.height}px. Minimum touch target is ${minSize}×${minSize}px.`,
      suggestion: `Increase the tap area to at least ${minSize}×${minSize}px to meet automotive interaction guidelines.`,
    });
  }

  return issues;
}

// ─── P1-2: Typography / font size ─────────────────────────────────────────
export function validateTypography(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const minFont: number = (rules.p1 as { minFontSizePt: number }).minFontSizePt;

  if (node.fontSize !== undefined && node.fontSize < minFont) {
    issues.push({
      id: "P1_TYPOGRAPHY",
      severity: "P1",
      title: "Font Size Below Minimum",
      message: `Node "${node.name}" uses a font size of ${node.fontSize}pt (minimum: ${minFont}pt).`,
      suggestion: `Increase font size to at least ${minFont}pt to ensure legibility at arm's reach.`,
    });
  }

  return issues;
}

// ─── P1-3: Layout / spacing consistency ───────────────────────────────────
export function validateLayout(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // STUB: flag nodes whose width or height is not divisible by 8 (8px grid)
  const onGrid = node.width % 8 === 0 && node.height % 8 === 0;
  if (!onGrid) {
    issues.push({
      id: "P1_LAYOUT_SPACING",
      severity: "P1",
      title: "Off-Grid Sizing",
      message: `Node "${node.name}" dimensions (${node.width}×${node.height}px) do not align to the 8px grid.`,
      suggestion: "Snap width and height to multiples of 8px for consistent spacing.",
    });
  }

  return issues;
}

// ─── P1-4: Component state / variants ─────────────────────────────────────
export function validateStates(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (
    (node.type === "COMPONENT" || node.type === "COMPONENT_SET") &&
    !node.hasVariants
  ) {
    issues.push({
      id: "P1_STATES",
      severity: "P1",
      title: "No Component Variants",
      message: `Component "${node.name}" has no variants defined (e.g. default, pressed, disabled, focused).`,
      suggestion:
        "Add variants for each interaction state to ensure complete UI coverage.",
    });
  }

  return issues;
}

// ─── Aggregate P1 runner ──────────────────────────────────────────────────
export function validateP1(node: NodeSnapshot): ValidationIssue[] {
  return [
    ...validateTouchSize(node),
    ...validateTypography(node),
    ...validateLayout(node),
    ...validateStates(node),
  ];
}
