"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { approveFlightPlan, compileFlightPlanToCsh } from "@/app/api/flight/flight-plan-service";
import { toast } from "sonner";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flightPlanId: number;
  onApprovalSuccess: () => void;
}

export function ApproveDialog({
  open,
  onOpenChange,
  flightPlanId,
  onApprovalSuccess,
}: ApproveDialogProps) {
  const [lgtmInput, setLgtmInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [compiledScript, setCompiledScript] = useState<string[] | null>(null);

  // Load compiled script when dialog opens
  useEffect(() => {
    if (open) {
      setLgtmInput("");
      setIsLoadingScript(true);
      
      const loadScript = async () => {
        try {
          const cshResult = await compileFlightPlanToCsh(flightPlanId);
          if (cshResult?.script) {
            setCompiledScript(cshResult.script);
          } else {
            toast.error("Compiled script format is invalid");
          }
        } catch (error) {
          console.error("Error loading compiled script:", error);
          toast.error("Failed to load compiled script");
        } finally {
          setIsLoadingScript(false);
        }
      };
      
      loadScript();
    } else {
      // Reset state when closing
      setCompiledScript(null);
      setLgtmInput("");
    }
  }, [open, flightPlanId]);

  const handleApprove = async () => {
    if (lgtmInput.toUpperCase() !== "LGTM") {
      toast.error("Please confirm with 'LGTM'");
      return;
    }

    setIsLoading(true);
    try {
      const result = await approveFlightPlan(flightPlanId, true);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onApprovalSuccess();
      } else {
        throw new Error(result.message || "Failed to approve flight plan");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Approval failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review & Approve Flight Plan</DialogTitle>
          <DialogDescription>
            Review the compiled command sequence below. Type &#34;LGTM&#34; to approve.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoadingScript ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-slate-600 border-t-slate-200 rounded-full"></div>
                <p className="text-sm text-muted-foreground">Loading compiled script...</p>
              </div>
            </div>
          ) : compiledScript && compiledScript.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Compiled Command Script:</div>
              <div className="bg-card rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto border border-primary-foreground">
                <div className="space-y-1">
                  {compiledScript.map((line, idx) => (
                    <div key={idx} className="flex hover:bg-primary/10 px-2 py-0.5 rounded transition-colors">
                      <span className="mr-4 text-muted-foreground select-none w-12 text-right">{idx + 1}</span>
                      <span className="flex-1">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">No compiled script available</p>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t px-1">
            <label className="text-sm font-medium">Confirm approval by typing &#34;LGTM&#34;:</label>
            <Input
              placeholder="Type LGTM to confirm"
              value={lgtmInput}
              onChange={(e) => setLgtmInput(e.target.value)}
              className="font-mono"
              disabled={isLoading || isLoadingScript}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading && !isLoadingScript && lgtmInput.toUpperCase() === "LGTM") {
                  handleApprove();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              {lgtmInput.length > 0 && lgtmInput.toUpperCase() !== "LGTM" 
                ? "Looks good to merge! (Type exactly: LGTM)"
                : "Looks good to merge! "}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isLoadingScript}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isLoading || lgtmInput.toUpperCase() !== "LGTM"}
            className={lgtmInput.toUpperCase() === "LGTM" ? "" : "opacity-50 cursor-not-allowed"}
          >
            {isLoading ? "Approving..." : "Approve (LGTM)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
