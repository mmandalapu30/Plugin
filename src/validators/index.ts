import { ValidationIssue, ValidationResult, NodeSnapshot } from "../types";
import { validateP0 } from "./p0-critical";
import { validateP1 } from "./p1-high";
import { validateP2 } from "./p2-medium";
import { validateP3 } from "./p3-low";

// ─── Score deductions per severity ────────────────────────────────────────
const DEDUCTIONS: Record<string, number> = {
  P0: 20,
  P1: 10,
  P2: 5,
  P3: 2,
};

/**
 * Calculate a compliance score (0–100) based on the collected issues.
 * Score starts at 100 and deductions are applied per issue found.
 */
export function calculateScore(issues: ValidationIssue[]): number {
  const total = issues.reduce((acc, issue) => {
    return acc - (DEDUCTIONS[issue.severity] ?? 0);
  }, 100);
  return Math.max(0, total);
}

/**
 * Run all validation passes (P0 → P1 → P2 → P3) against a node snapshot
 * and return a structured ValidationResult.
 */
export function runValidation(node: NodeSnapshot): ValidationResult {
  const issues: ValidationIssue[] = [];

  issues.push(...validateP0(node));
  issues.push(...validateP1(node));
  issues.push(...validateP2(node));
  issues.push(...validateP3(node));

  const score = calculateScore(issues);

  return {
    score,
    issues,
    timestamp: new Date().toISOString(),
  };
}

export { validateP0, validateP1, validateP2, validateP3 };
