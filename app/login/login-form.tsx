"use client";

import { Button } from "@/components/ui/button";
export default function LoginForm() {
  return (
    <div className="space-y-6">
      <Button
        onClick={() => window.location.href = "/auth/login"}
      
        className="w-full py-6 text-xl bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-glow-purple"
      >
        Login with Google
      </Button>
    </div>
  );
}