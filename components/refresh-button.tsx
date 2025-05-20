"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you have this utility

interface RefreshButtonProps {
  onClick?: () => void | Promise<void>;
  duration?: number; // How long to show the animation in ms
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  title?: string;
  
}

export function RefreshButton({
  onClick = () => {},
  duration = 750, // Default animation duration
  className,
  variant = "ghost",
  size = "icon",
  title = "Refresh",
  
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    setIsRefreshing(true);

    try {
      // Handle both synchronous and Promise-based onClick handlers
      const result = onClick();
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error("Error in refresh operation:", error);
    }

    // Keep spinning for at least the specified duration
    // This ensures the animation is visible even for quick operations
    setTimeout(() => {
      setIsRefreshing(false);
    }, duration);
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={isRefreshing}
      className={cn(className)}
      title={title}
      aria-label={title}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </Button>
  );
}
