"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GroundStation } from "@/app/api/platform/ground-stations/types";
import { deleteGroundStation } from "@/app/api/platform/ground-stations/ground-station-service";
import { refreshGroundStations } from "@/app/actions/ground-stations";
import { useState } from "react";

export function DeleteGroundStationModal({
  station,
  open,
  onOpenChange,
}: {
  station: GroundStation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const onConfirm = async () => {
    setDeleting(true);
    await deleteGroundStation(station.id);
    await refreshGroundStations();
    setDeleting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete ground station</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{station.name}&quot;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
