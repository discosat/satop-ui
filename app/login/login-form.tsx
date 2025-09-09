"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { goToWayf } from "../actions/wayf";
import { login } from "../actions/login";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await login(email, password);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleWAYFLogin = async () => {
    setIsLoading(true);
    await goToWayf(window.location.origin);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-purple-300"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="operator@discosat.dk"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-space-input border-space-border text-white placeholder-gray-500"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-purple-300"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-space-input border-space-border text-white"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-6 text-xl bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-glow-purple"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging In...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
      
      {process.env.NEXT_PUBLIC_USE_WAYF === "1" && (
        <>
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-space-border"></div>
                <span className="flex-shrink mx-4 text-space-subtext">Or</span>
                <div className="flex-grow border-t border-space-border"></div>
            </div>
            <Button
                onClick={handleWAYFLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full py-6 text-xl bg-transparent border-purple-500 text-purple-300 hover:bg-purple-900/50 hover:text-white transition-colors duration-300"
            >
                Launch with WAYF
            </Button>
        </>
      )}
    </div>
  );
}