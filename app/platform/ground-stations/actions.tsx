"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";
import { EditGroundStationModal } from "./edit-ground-station-modal";
import { DeleteGroundStationModal } from "./delete-ground-station-modal";

export function GroundStationActions({ station }: { station: GroundStation }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Edit ground station
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600"
          >
            Delete ground station
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditGroundStationModal
        station={station}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteGroundStationModal
        station={station}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
