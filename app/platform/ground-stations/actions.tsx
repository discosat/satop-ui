"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
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
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit ground station
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" /> Delete ground station
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
