/**
 * code.ts — Figma plugin main thread.
 *
 * This file runs inside Figma's sandbox (no DOM access).
 * It communicates with the UI iframe via postMessage.
 */

import { NodeSnapshot, MessageToPlugin } from "./types";
import { runValidation } from "./validators/index";

// ─── UI dimensions ────────────────────────────────────────────────────────
const UI_WIDTH = 380;
const UI_HEIGHT = 680;

figma.showUI(__html__, { width: UI_WIDTH, height: UI_HEIGHT, title: "Automotive Compliance Checker" });

// ─── Helper: build a serialisable snapshot from a Figma SceneNode ─────────
function buildSnapshot(node: SceneNode, depth: number): NodeSnapshot {
  const hasGeometry = "width" in node && "height" in node;
  const width = hasGeometry ? (node as FrameNode).width : 0;
  const height = hasGeometry ? (node as FrameNode).height : 0;

  const hasFills = "fills" in node;
  const fills = hasFills ? (node as GeometryMixin).fills : [];

  const hasChildren = "children" in node;
  const childCount = hasChildren ? (node as ChildrenMixin).children.length : 0;

  const hasFontSize =
    node.type === "TEXT" && "fontSize" in node && typeof (node as TextNode).fontSize === "number";
  const fontSize = hasFontSize ? ((node as TextNode).fontSize as number) : undefined;

  const hasVariants =
    node.type === "COMPONENT_SET" ||
    (node.type === "COMPONENT" && "variantProperties" in node && node.variantProperties !== null);

  const hasPluginData = node.getSharedPluginDataKeys("compliance").length > 0;

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    width,
    height,
    depth,
    childCount,
    fills: fills as ReadonlyArray<Paint>,
    fontSize,
    hasVariants,
    hasPluginData,
  };
}

// ─── Helper: calculate node depth from page root ──────────────────────────
function getNodeDepth(node: BaseNode): number {
  let depth = 0;
  let current: BaseNode | null = node.parent;
  while (current !== null && current.type !== "PAGE" && current.type !== "DOCUMENT") {
    depth++;
    current = current.parent;
  }
  return depth;
}

// ─── Core: run validation on the current selection ───────────────────────
function validateSelection(): void {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({ type: "SELECTION_CLEARED" });
    return;
  }

  // Use the first selected node
  const node = selection[0];
  const depth = getNodeDepth(node);
  const snapshot = buildSnapshot(node, depth);

  // Send loading indicator
  figma.ui.postMessage({ type: "LOADING" });

  // Run validation (synchronous stub logic)
  const result = runValidation(snapshot);

  // Send result + snapshot in one message
  const resultMsg = {
    type: "VALIDATION_RESULT" as const,
    payload: result,
    snapshot,
  };
  figma.ui.postMessage(resultMsg);
}

// ─── Listen for messages from the UI ─────────────────────────────────────
figma.ui.onmessage = (msg: MessageToPlugin) => {
  switch (msg.type) {
    case "RUN_VALIDATION":
    case "REFRESH_SELECTION":
      validateSelection();
      break;
    default:
      break;
  }
};

// ─── React to selection changes ───────────────────────────────────────────
figma.on("selectionchange", () => {
  validateSelection();
});

// Run once on open
validateSelection();
