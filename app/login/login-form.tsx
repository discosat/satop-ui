"use client";
import { login } from "@/app/actions/login";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const handleWAYFLogin = async () => {
    setIsLoading(true);
    // Simulate login process
    await new Promise((resolve) => setTimeout(resolve, 500));
    await login();
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
