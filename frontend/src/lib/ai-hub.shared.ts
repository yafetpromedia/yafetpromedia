/** Appended by the chat assistant when recommending the Plan tab; stripped before display. */
export const AI_PLAN_ACTION_MARKER = "[[OPEN_PLAN]]";

export function stripPlanActionMarker(text: string): { content: string; suggestPlan: boolean } {
  const suggestPlan = text.includes(AI_PLAN_ACTION_MARKER);
  const content = text.replace(new RegExp(`\\s*${AI_PLAN_ACTION_MARKER}\\s*`, "g"), "").trim();
  return { content, suggestPlan };
}
