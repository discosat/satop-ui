"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { goToWayf } from "../actions/wayf";
import { login } from "../actions/login";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const handleWAYFLogin = async () => {
    // Simulate login process
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (process.env.NEXT_PUBLIC_USE_WAYF === "1") {
      await goToWayf(window.location.origin);
    } else {
      await login();
    }
    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleWAYFLogin}
      disabled={isLoading}
      className="w-full py-6 text-xl bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-glow-purple"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Launching...
        </>
      ) : (
        "Launch with WAYF"
      )}
    </Button>
  );
}
