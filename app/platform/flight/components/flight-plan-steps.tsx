"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";

type StepKey =
  | "DRAFT"
  | "APPROVED"
  | "REJECTED"
  | "ASSIGNED_TO_OVERPASS"
  | "TRANSMITTED"
  | "SUPERSEDED"
  | "FAILED";

export interface FlightPlanStepsProps {
  status: StepKey;
  className?: string;
}

const ORDERED_STEPS: {
  key: Exclude<StepKey, "REJECTED" | "SUPERSEDED">;
  label: string;
}[] = [
  { key: "DRAFT", label: "Create" },
  { key: "APPROVED", label: "Approve" },
  { key: "ASSIGNED_TO_OVERPASS", label: "Assign to overpass" },
  { key: "TRANSMITTED", label: "Transmit" },
];

function getActiveIndex(status: StepKey): number {
  switch (status) {
    case "DRAFT":
      return 0;
    case "APPROVED":
      return 1;
    case "ASSIGNED_TO_OVERPASS":
      return 2;
    case "TRANSMITTED":
      return 3;
    case "REJECTED":
      // Rejected branches off after draft approval phase
      return 1;
    case "FAILED":
      // Failed happens at the transmit stage
      return 3;
    case "SUPERSEDED":
      // Consider superseded as terminal beyond transmit for visualization
      return ORDERED_STEPS.length - 1;
    default:
      return 0;
  }
}

// Get next action text based on current status
function getNextAction(status: StepKey): string | null {
  switch (status) {
    case "DRAFT":
      return "Review and approve the flight plan to proceed";
    case "APPROVED":
      return "Assign to an overpass window to schedule execution";
    case "ASSIGNED_TO_OVERPASS":
      return "Flight plan will be transmitted automatically at scheduled time";
    case "TRANSMITTED":
      return "Flight plan has been transmitted to the satellite";
    case "REJECTED":
      return null;
    case "FAILED":
      return null;
    case "SUPERSEDED":
      return null;
    default:
      return null;
  }
}

export default function FlightPlanSteps({
  status,
  className,
}: FlightPlanStepsProps) {
  const activeIndex = getActiveIndex(status);
  const isRejected = status === "REJECTED";
  const isFailed = status === "FAILED";
  const isSuperseded = status === "SUPERSEDED";
  const nextAction = getNextAction(status);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <ol className="flex w-full items-center justify-between gap-2">
        {ORDERED_STEPS.map((step, index) => {
          const isCompleted =
            index < activeIndex ||
            (!isRejected && index === activeIndex && status !== "DRAFT");
          const isActive = index === activeIndex;
          const isNext = index === activeIndex + 1;

          return (
            <li key={step.key} className="flex-1">
              <div className="flex items-center">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-medium transition-all",
                    isActive &&
                      !isRejected &&
                      !isFailed &&
                      "border-primary bg-primary text-primary-foreground shadow-lg",
                    isCompleted &&
                      !isActive &&
                      "border-primary bg-primary/10 text-primary",
                    isNext &&
                      !isCompleted &&
                      "border-primary/50 bg-primary/5 text-primary/70",
                    !isCompleted &&
                      !isActive &&
                      !isNext &&
                      "border-muted-foreground/30 text-muted-foreground",
                    (isRejected || isFailed) &&
                      index === activeIndex &&
                      "border-destructive bg-destructive text-destructive-foreground"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isActive && !isRejected && !isFailed ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Connector */}
                {index < ORDERED_STEPS.length - 1 && (
                  <div className="mx-2 flex-1 flex items-center gap-1">
                    <div
                      className={cn(
                        "h-[2px] flex-1 rounded transition-all",
                        index < activeIndex ? "bg-primary" : "bg-muted"
                      )}
                    />
                    {isActive && !isRejected && !isFailed && (
                      <ArrowRight className="h-3 w-3 text-primary animate-pulse" />
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2 space-y-0.5 min-h-[2.5rem]">
                <div
                  className={cn(
                    "text-xs font-medium transition-all",
                    isActive
                      ? "text-foreground font-semibold"
                      : isCompleted
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </div>
                <div className="h-[14px] flex items-center">
                  {isActive && !isRejected && (
                    <div className="text-[10px] text-primary flex items-center gap-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                      Current
                    </div>
                  )}
                  {isNext && !isRejected && !isFailed && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      Next step
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      
      {/* Next Action Banner */}
      {nextAction && !isRejected && !isSuperseded && !isFailed && (
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="mt-0.5">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium text-foreground">
              Next Action
            </div>
            <div className="text-sm text-muted-foreground">
              {nextAction}
            </div>
          </div>
        </div>
      )}

      {(isRejected || isSuperseded || isFailed) && (
        <div
          className={cn(
            "p-3 rounded-lg border text-sm",
            isFailed
              ? "bg-destructive/5 border-destructive/20 text-destructive"
              : isRejected
              ? "bg-destructive/5 border-destructive/20 text-destructive"
              : "bg-muted/50 border-muted text-muted-foreground"
          )}
        >
          {isFailed
            ? "❌ Flight plan execution failed and cannot proceed further"
            : isRejected
            ? "⚠️ Flight plan was rejected and cannot proceed further"
            : "ℹ️ Flight plan was superseded by a newer version"}
        </div>
      )}
    </div>
  );
}
