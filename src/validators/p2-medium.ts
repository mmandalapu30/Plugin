import { ValidationIssue, NodeSnapshot } from "../types";
import rules from "../config/rules.json";

/**
 * P2 — Medium-priority validators.
 *
 * STUB LOGIC: Replace the bodies with real platform-specific rule checks.
 */

// ─── P2-1: Platform nesting depth ─────────────────────────────────────────
export function validatePlatformNesting(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const maxDepth: number = (rules.p2 as { maxNodeDepth: number }).maxNodeDepth;

  if (node.depth > maxDepth) {
    issues.push({
      id: "P2_PLATFORM_NESTING",
      severity: "P2",
      title: "Deep Layout Nesting",
      message: `Node "${node.name}" is nested ${node.depth} levels deep (max recommended: ${maxDepth}).`,
      suggestion:
        "Flatten the component hierarchy to reduce rendering overhead and improve maintainability.",
    });
  }

  return issues;
}

// ─── P2-2: Interaction / node depth ───────────────────────────────────────
export function validateInteraction(node: NodeSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const maxDepth: number = (rules.p2 as { maxNodeDepth: number }).maxNodeDepth;

  if (node.depth > maxDepth) {
    issues.push({
      id: "P2_INTERACTION_DEPTH",
      severity: "P2",
      title: "Interaction Target Too Deep",
      message: `Node "${node.name}" at depth ${node.depth} may be hard to reach via prototyping interactions.`,
      suggestion:
        "Move interactive elements closer to the root to simplify prototype connections.",
    });
  }

  return issues;
}

// ─── P2-3: Animation stub ─────────────────────────────────────────────────
export function validateAnimation(node: NodeSnapshot): ValidationIssue[] {
  // STUB (intentional): always warn because Figma's API does not expose
  // prototype transition details at the SceneNode level. Replace this body
  // with real easing/duration checks once the animation data is accessible.
  return [
    {
      id: "P2_ANIMATION",
      severity: "P2",
      title: "Animation Rules Not Verified",
      message: `Animation constraints for node "${node.name}" could not be automatically verified.`,
      suggestion:
        "Ensure transitions are ≤300ms and use ease-in-out curves per automotive HMI guidelines.",
    },
  ];
}

// ─── Aggregate P2 runner ──────────────────────────────────────────────────
export function validateP2(node: NodeSnapshot): ValidationIssue[] {
  return [
    ...validatePlatformNesting(node),
    ...validateInteraction(node),
    ...validateAnimation(node),
  ];
}
