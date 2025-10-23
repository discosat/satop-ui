"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Activity } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { checkGroundStationHealth } from "@/app/api/ground-stations/ground-station-service";
import { EditGroundStationModal } from "./edit-ground-station-modal";
import { DeleteGroundStationModal } from "./delete-ground-station-modal";

export function GroundStationActions({ station }: { station: GroundStation }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const handleHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const healthData = await checkGroundStationHealth(station.id);
      if (healthData) {
        const isConnected = healthData.connected;
        const statusLabel = isConnected ? "Connected" : "Disconnected";
        toast.success(
          `Health Check: ${healthData.name}`,
          {
            description: `Status: ${statusLabel} - (checked at ${new Date(healthData.checkedAt).toLocaleString()})`,
          }
        );
        if (!isConnected) {
          toast.error("Ground station is disconnected", {
            description: "Please check the connection and investigate the issue.",
          });
        }
      } else {
        toast.error("Health Check Failed", {
          description: "Unable to retrieve health status from the ground station",
        });
      }
    } catch (error) {
      console.error('Health check error:', error);
      toast.error("Health Check Error", {
        description: "An error occurred while checking the ground station health",
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none'
        }
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={handleHealthCheck}
            disabled={isCheckingHealth}
          >
            <Activity className="mr-2 h-4 w-4" />
            {isCheckingHealth ? "Checking..." : "Health Check"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
