"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GripVertical,
  Trash2,
  Plus,
  Camera,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { CommandType, Command, getDefaultCameraSettings, getDefaultCaptureLocation } from "./command";
import { TriggerCaptureCommand } from "./trigger-capture-command";
import { TriggerPipelineCommand } from "./trigger-pipeline-command";
import { CoordinateMapDialog } from "./coordinate-map";

interface CommandBuilderProps {
  commands: Command[];
  onCommandsChange: (commands: Command[]) => void;
  isReadOnly?: boolean;
  satelliteId?: number;
}

export function CommandBuilder({
  commands,
  onCommandsChange,
  isReadOnly = false,
  satelliteId,
}: CommandBuilderProps) {
  const [selectedCommandType, setSelectedCommandType] = useState<
    CommandType | ""
  >("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);

  const addCommand = (type: CommandType) => {
    if (isReadOnly) return;
    
    const newCommand: Command =
      type === "TRIGGER_CAPTURE"
        ? {
            type: "TRIGGER_CAPTURE",
            id: crypto.randomUUID(),
            captureLocation: getDefaultCaptureLocation(),
            cameraSettings: getDefaultCameraSettings(),
          }
        : {
            type: "TRIGGER_PIPELINE",
            id: crypto.randomUUID(),
            executionTime: new Date().toISOString(),
            mode: 1,
          };

    onCommandsChange([...commands, newCommand]);
    setSelectedCommandType("");
    
    // Optional: Scroll to the new command (if you want this behavior)
    setTimeout(() => {
      const commandElements = document.querySelectorAll('[role="list"] > div');
      const lastElement = commandElements[commandElements.length - 1];
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const removeCommand = (id: string) => {
    if (isReadOnly) return;
    onCommandsChange(commands.filter((cmd) => cmd.id !== id));
  };

  const updateCommand = (id: string, updater: (cmd: Command) => Command) => {
    if (isReadOnly) return;
    onCommandsChange(
      commands.map((cmd) => (cmd.id === id ? updater(cmd) : cmd))
    );
  };

  const moveCommandUp = (id: string) => {
    if (isReadOnly) return;
    const currentIndex = commands.findIndex((c) => c.id === id);
    if (currentIndex <= 0) return; // Can't move up if already at top
    
    const newCommands = [...commands];
    const temp = newCommands[currentIndex];
    newCommands[currentIndex] = newCommands[currentIndex - 1];
    newCommands[currentIndex - 1] = temp;
    
    onCommandsChange(newCommands);
  };

  const moveCommandDown = (id: string) => {
    if (isReadOnly) return;
    const currentIndex = commands.findIndex((c) => c.id === id);
    if (currentIndex >= commands.length - 1) return; // Can't move down if already at bottom
    
    const newCommands = [...commands];
    const temp = newCommands[currentIndex];
    newCommands[currentIndex] = newCommands[currentIndex + 1];
    newCommands[currentIndex + 1] = temp;
    
    onCommandsChange(newCommands);
  };

  const reorderCommandsById = (fromId: string, toId: string) => {
    if (isReadOnly || fromId === toId) return;
    const currentIndex = commands.findIndex((c) => c.id === fromId);
    const targetIndex = commands.findIndex((c) => c.id === toId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const next = [...commands];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    onCommandsChange(next);
  };

  const openMapForCommand = (commandId: string) => {
    if (isReadOnly) return;
    setEditingCommandId(commandId);
    setMapDialogOpen(true);
  };

  const handleCoordinateSelect = (coordinate: { x: number; y: number }) => {
    if (!editingCommandId) return;
    updateCommand(editingCommandId, (cmd) => {
      if (cmd.type === "TRIGGER_CAPTURE") {
        // Convert map coordinates to lat/long
        return { ...cmd, captureLocation: { latitude: coordinate.y, longitude: coordinate.x } };
      }
      return cmd;
    });
    // Keep the dialog open so users can continue adjusting the location
    // Dialog will close when user clicks outside or presses ESC
  };

  return (
    <div className="space-y-6">
      {/* Add Command Section - only show if not readonly */}
      {!isReadOnly && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Add command</div>
          <div className="flex gap-3">
            <Select
              value={selectedCommandType}
              onValueChange={(value) => {
                const v = value as CommandType;
                setSelectedCommandType(v);
                addCommand(v);
              }}
            >
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Select command type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRIGGER_CAPTURE">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span>Trigger Capture</span>
                  </div>
                </SelectItem>
                <SelectItem value="TRIGGER_PIPELINE">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Trigger Pipeline</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Command List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {commands.length === 0
                ? "No commands added yet."
                : `${commands.length} command${
                    commands.length === 1 ? "" : "s"
                  } in sequence`}
            </div>
            {commands.length > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
              >
                {commands.length}
              </motion.div>
            )}
          </div>
        </div>
        {commands.length === 0 ? (
          <motion.div 
            className="text-center py-12 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="h-12 w-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            >
              <Plus className="h-6 w-6" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              No commands in sequence
            </motion.p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              className="space-y-3" 
              role="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {commands.map((command, index) => (
                <motion.div
                  key={command.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                    layout: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
                  }}
                  whileHover={{ scale: 1.009 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CommandItem
                    command={command}
                    index={index}
                    totalCommands={commands.length}
                    onRemove={() => removeCommand(command.id)}
                    onUpdate={(updater) => updateCommand(command.id, updater)}
                    onMoveUp={() => moveCommandUp(command.id)}
                    onMoveDown={() => moveCommandDown(command.id)}
                    isReadOnly={isReadOnly}
                    draggable={!isReadOnly}
                    isDragOver={dragOverId === command.id}
                    satelliteId={satelliteId}

                    onDragStartItem={() => {
                      setDraggedId(command.id);
                    }}
                    onDragOverItem={(evt) => {
                      evt.preventDefault();
                      setDragOverId(command.id);
                    }}
                    onDragLeaveItem={() => {
                      if (dragOverId === command.id) setDragOverId(null);
                    }}
                    onDropOnItem={() => {
                      if (draggedId) {
                        reorderCommandsById(draggedId, command.id);
                      }
                      setDragOverId(null);
                      setDraggedId(null);
                    }}
                    openMapForCommand={openMapForCommand}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Coordinate Map Dialog */}
      <CoordinateMapDialog
        open={mapDialogOpen}
        onOpenChange={(open) => {
          setMapDialogOpen(open);
          if (!open) {
            // Reset editing command ID when dialog is closed
            setEditingCommandId(null);
          }
        }}
        selectedCoordinate={
          editingCommandId
            ? (() => {
                const cmd = commands.find((c) => c.id === editingCommandId);
                return cmd && cmd.type === "TRIGGER_CAPTURE" 
                  ? { x: cmd.captureLocation.longitude, y: cmd.captureLocation.latitude } 
                  : undefined;
              })()
            : undefined
        }
        onCoordinateSelect={handleCoordinateSelect}
        satelliteId={satelliteId}
      />
    </div>
  );
}

interface CommandItemProps {
  command: Command;
  index: number;
  totalCommands: number;
  onRemove: () => void;
  onUpdate: (updater: (cmd: Command) => Command) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isReadOnly?: boolean;
  draggable?: boolean;
  isDragOver?: boolean;
  onDragStartItem?: () => void;
  onDragOverItem?: (evt: React.DragEvent<HTMLDivElement>) => void;
  onDragLeaveItem?: () => void;
  onDropOnItem?: () => void;
  openMapForCommand?: (commandId: string) => void;
  satelliteId?: number;
}

function CommandItem({
  command,
  index,
  totalCommands,
  onRemove,
  onUpdate,
  onMoveUp,
  onMoveDown,
  isReadOnly,
  draggable,
  isDragOver,
  onDragStartItem,
  onDragOverItem,
  onDragLeaveItem,
  onDropOnItem,
  openMapForCommand,
  satelliteId,
}: CommandItemProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg bg-card transition-all duration-300 ${
        isDragOver
          ? "border-primary/50 ring-2 ring-primary/30 shadow-lg"
          : "hover:border-primary/50 hover:shadow-md"
      }`}
      draggable={draggable}
      onDragStart={onDragStartItem}
      onDragOver={onDragOverItem}
      onDragLeave={onDragLeaveItem}
      onDrop={onDropOnItem}
    >
      {/* Order Indicator / Drag Handle */}
      <div className="flex flex-col gap-1 pt-1 items-center">
        {!isReadOnly && (
          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.1 }}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          </motion.div>
        )}
        <motion.span 
          className="text-xs text-muted-foreground text-center font-mono bg-muted px-1.5 py-0.5 rounded-full min-w-[20px]"
          key={index} // Force re-render on position change
          initial={{ scale: 1.2, backgroundColor: "hsl(var(--primary) / 0.2)" }}
          animate={{ scale: 1, backgroundColor: "hsl(var(--muted))" }}
          transition={{ duration: 0.2 }}
        >
          {index + 1}
        </motion.span>
      </div>

      {/* Command Content */}
      <div className="flex-1">
        {command.type === "TRIGGER_CAPTURE" ? (
          <TriggerCaptureCommand
            command={command}
            onUpdate={onUpdate}
            onOpenMap={openMapForCommand ? () => openMapForCommand(command.id) : undefined}
            satelliteId={satelliteId}
          />
        ) : (
          <TriggerPipelineCommand
            command={command}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex flex-col gap-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-colors ${
                index === 0 
                  ? "opacity-40 cursor-not-allowed" 
                  : "hover:bg-primary/10 hover:text-primary"
              }`}
              onClick={onMoveUp}
              disabled={index === 0}
              aria-label={index === 0 ? "Already at top" : "Move command up"}
              title={index === 0 ? "Already at top" : "Move command up"}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-colors ${
                index === totalCommands - 1 
                  ? "opacity-40 cursor-not-allowed" 
                  : "hover:bg-primary/10 hover:text-primary"
              }`}
              onClick={onMoveDown}
              disabled={index === totalCommands - 1}
              aria-label={index === totalCommands - 1 ? "Already at bottom" : "Move command down"}
              title={index === totalCommands - 1 ? "Already at bottom" : "Move command down"}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={onRemove}
              aria-label="Delete command"
              title="Delete command"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}