// components/logout-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({ 
  variant = "ghost", 
  size = "default",
  className,
  showIcon = true 
}: LogoutButtonProps) {
  const handleLogout = () => {
    window.location.href = "/auth/logout";
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Logout
    </Button>
  );
}
