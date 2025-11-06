"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/platform";

  const handleLogin = () => {
    const loginUrl = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.href = loginUrl;
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={handleLogin}
        className="w-full py-6 text-xl bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-glow-purple"
      >
        Login with Auth0
      </Button>
    </div>
  );
}