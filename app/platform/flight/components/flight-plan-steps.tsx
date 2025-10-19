"use client";

import { cn } from "@/lib/utils";
import React from "react";

type StepKey =
  | "DRAFT"
  | "APPROVED"
  | "REJECTED"
  | "ASSIGNED_TO_OVERPASS"
  | "TRANSMITTED"
  | "SUPERSEDED";

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
    case "SUPERSEDED":
      // Consider superseded as terminal beyond transmit for visualization
      return ORDERED_STEPS.length - 1;
    default:
      return 0;
  }
}

export default function FlightPlanSteps({
  status,
  className,
}: FlightPlanStepsProps) {
  const activeIndex = getActiveIndex(status);
  const isRejected = status === "REJECTED";
  const isSuperseded = status === "SUPERSEDED";

  return (
    <div className={cn("w-full", className)}>
      <ol className="flex w-full items-center justify-between gap-2">
        {ORDERED_STEPS.map((step, index) => {
          const isCompleted =
            index < activeIndex ||
            (!isRejected && index === activeIndex && status !== "DRAFT");
          const isActive = index === activeIndex;

          return (
            <li key={step.key} className="flex-1">
              <div className="flex items-center">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                    isActive &&
                      !isRejected &&
                      "border-primary bg-primary text-primary-foreground",
                    isCompleted &&
                      !isActive &&
                      "border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isActive &&
                      "border-muted text-muted-foreground",
                    isRejected &&
                      index === activeIndex &&
                      "border-destructive bg-destructive text-destructive-foreground"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {index + 1}
                </div>

                {/* Connector */}
                {index < ORDERED_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-[2px] flex-1 rounded",
                      index < activeIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div
                className={cn(
                  "mt-2 text-xs font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </div>
            </li>
          );
        })}
      </ol>
      {(isRejected || isSuperseded) && (
        <div
          className={cn(
            "mt-2 text-xs",
            isRejected ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {isRejected
            ? "Flight plan was rejected"
            : "Flight plan was superseded by a newer version"}
        </div>
      )}
    </div>
  );
}
