"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, FileText, MessageCircle, X } from "lucide-react";
import { useConsultantSession } from "@/components/consultant/ConsultantSessionContext";
import ConsultantBriefPreview from "@/components/consultant/ConsultantBriefPreview";
import { completenessScore, factValue } from "@/lib/project-model";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  onOpenTalk?: () => void;
};

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition", open && "rotate-180")} />
      </button>
      {open ? <div className="space-y-2 px-4 pb-4 text-[13px] text-foreground/80">{children}</div> : null}
    </div>
  );
}

function FactRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <dt className="text-[11px] uppercase tracking-wide text-foreground/40">{label}</dt>
      <dd className="leading-relaxed">{value?.trim() || <span className="text-foreground/40">Not provided</span>}</dd>
    </div>
  );
}

export default function ConsultantPlanWorkspace({ active, onOpenTalk }: Props) {
  const { project, brief, loading, briefEmailed, ensureStarted, send, reset } = useConsultantSession();
  const [showBrief, setShowBrief] = useState(false);
  const { percent, missing } = completenessScore(project);

  useEffect(() => {
    if (active) void ensureStarted();
  }, [active, ensureStarted]);

  const generateBrief = async () => {
    await send({ action: "request_brief" });
    setShowBrief(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#faf9f7]">
      <div className="shrink-0 border-b border-border/60 bg-white px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff6a00]">
          Project plan
        </p>
        <h3 className="mt-1 font-display text-base font-semibold tracking-tight text-[#0c0c0c]">
          {factValue(project.identity.name) ||
            factValue(project.identity.projectType) ||
            "Untitled project"}
        </h3>
        <p className="mt-1 line-clamp-2 text-[12px] text-foreground/60">
          {factValue(project.identity.shortDescription) ||
            factValue(project.identity.problem) ||
            "Details will appear here as you talk."}
        </p>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-foreground/50">
            <span>Confirmed essentials</span>
            <span>
              {percent}% · stage {project.planningStage.replace("_", " ")}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[#ff6a00] transition-all" style={{ width: `${percent}%` }} />
          </div>
          {missing.length ? (
            <p className="mt-1.5 text-[11px] text-foreground/45">Still needed: {missing.join(", ")}</p>
          ) : (
            <p className="mt-1.5 text-[11px] text-emerald-700">Core essentials confirmed.</p>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {showBrief && brief ? (
          <ConsultantBriefPreview
            brief={brief}
            emailed={briefEmailed}
            onClose={() => setShowBrief(false)}
          />
        ) : (
          <>
            <Section title="Overview" defaultOpen>
              <dl className="space-y-2">
                <FactRow label="Type" value={factValue(project.identity.projectType)} />
                <FactRow label="Industry" value={factValue(project.identity.industry)} />
                <FactRow label="Problem" value={factValue(project.identity.problem)} />
                <FactRow label="Vision" value={factValue(project.identity.vision)} />
                <FactRow label="Users" value={factValue(project.stakeholders.intendedUsers)} />
                <FactRow label="Objectives" value={factValue(project.scope.objectives)} />
              </dl>
            </Section>

            <Section title="Scope & features">
              <FactRow label="Scope" value={factValue(project.scope.products)} />
              <FactRow label="Platforms" value={factValue(project.scope.platforms)} />
              <FactRow label="Exclusions" value={factValue(project.scope.exclusions)} />
              {project.scope.features.length ? (
                <ul className="mt-2 space-y-1.5">
                  {project.scope.features.map((f) => (
                    <li key={f.id} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                      <span>
                        <span className="font-medium">{f.name}</span>
                        <span className="text-foreground/45"> · {f.status.replace("_", " ")}</span>
                        {f.description ? (
                          <span className="mt-0.5 block text-[12px] text-foreground/65">{f.description}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-foreground/40">No features captured yet.</p>
              )}
            </Section>

            <Section title="Technical direction">
              <p className="mb-2 text-[11px] text-foreground/45">Suggestions until you approve them.</p>
              <FactRow label="Architecture" value={factValue(project.technical.architecture)} />
              <FactRow label="Stack" value={factValue(project.technical.stack)} />
              <FactRow label="Hosting" value={factValue(project.technical.hosting)} />
              <FactRow label="Security" value={factValue(project.technical.security)} />
            </Section>

            <Section title="Timeline">
              <FactRow label="Your preference" value={factValue(project.timeline.clientTimeline)} />
              <FactRow
                label="Est. duration"
                value={
                  factValue(project.timeline.estimatedDuration)
                    ? `${factValue(project.timeline.estimatedDuration)} (suggestion)`
                    : undefined
                }
              />
              <FactRow label="Phases" value={factValue(project.timeline.phases)} />
            </Section>

            <Section title="Budget">
              <FactRow label="Stated budget" value={factValue(project.commercial.clientBudget)} />
              <FactRow
                label="Est. cost"
                value={
                  factValue(project.commercial.estimatedCost)
                    ? `${factValue(project.commercial.estimatedCost)} (suggestion)`
                    : undefined
                }
              />
              <FactRow
                label="Payments"
                value={factValue(project.commercial.paymentMethods)?.join(", ")}
              />
            </Section>

            <Section title="Risks & assumptions">
              {project.risks.length ? (
                <ul className="space-y-1">
                  {project.risks.map((r) => (
                    <li key={r.id}>• {r.label}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-foreground/40">None listed yet.</p>
              )}
              {project.assumptions.length ? (
                <ul className="mt-2 space-y-1">
                  {project.assumptions.map((a, i) => (
                    <li key={i} className="text-amber-800/80">
                      Assumption: {String(a.value)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Section>

            <Section title="Open questions" defaultOpen>
              {project.openQuestions.length ? (
                <ul className="space-y-2">
                  {project.openQuestions.map((q) => (
                    <li key={q.id} className="rounded-xl border border-border/70 bg-white px-3 py-2">
                      <p>{q.question}</p>
                      <p className="mt-1 text-[11px] text-foreground/40">
                        {q.area} · {q.priority}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-foreground/40">No open questions right now.</p>
              )}
              {onOpenTalk ? (
                <button
                  type="button"
                  onClick={onOpenTalk}
                  className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#ff6a00]"
                >
                  <MessageCircle className="size-3.5" /> Discuss in Talk
                </button>
              ) : null}
            </Section>

            <Section title="Recommendations" defaultOpen>
              {project.recommendations.length ? (
                <ul className="space-y-2">
                  {project.recommendations.map((r) => (
                    <li key={r.id} className="rounded-xl border border-border/70 bg-white px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{r.title}</p>
                          <p className="mt-0.5 text-[12px] text-foreground/65">{r.detail}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-wide text-foreground/40">
                            {r.status.replace("_", " ")} · {r.category}
                          </p>
                        </div>
                        {r.status === "ai_suggested" || r.status === "pending" ? (
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              disabled={loading}
                              aria-label="Approve"
                              onClick={() =>
                                void send({
                                  action: "approve_recommendation",
                                  recommendationId: r.id,
                                })
                              }
                              className="rounded-lg bg-emerald-600/10 p-1.5 text-emerald-700 hover:bg-emerald-600/20"
                            >
                              <Check className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              aria-label="Reject"
                              onClick={() =>
                                void send({
                                  action: "reject_recommendation",
                                  recommendationId: r.id,
                                })
                              }
                              className="rounded-lg bg-red-600/10 p-1.5 text-red-700 hover:bg-red-600/20"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-foreground/40">Suggestions will appear as the conversation develops.</p>
              )}
            </Section>
          </>
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-border/70 bg-white p-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => void generateBrief()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c0c0c] py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          <FileText className="size-4" /> Generate project brief
        </button>
        {brief ? (
          <button
            type="button"
            onClick={() => setShowBrief(true)}
            className="w-full rounded-xl border border-border py-2 text-sm font-medium"
          >
            View brief preview
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void reset()}
          className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
