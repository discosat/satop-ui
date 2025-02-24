"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Starfield from "./components/starfield";
import ParticleBackground from "./components/particle-background";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleWAYFLogin = async () => {
    setIsLoading(true);
    // Simulate login process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    // Implement actual WAYF login logic here
    console.log("WAYF login initiated");
  };

  return (
    <div className="min-h-screen bg-space-image bg-cover bg-center flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <Starfield />
      <ParticleBackground />
      <div className="z-10 w-full max-w-md p-8 space-y-8 bg-space-card rounded-lg backdrop-blur-sm backdrop-filter border border-space-border shadow-space">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center my-12">
            <Image
              src="/logo.png"
              width={96}
              height={96}
              className="drop-shadow-[0_0_15px_rgba(216,180,254,0.6)]"
              alt="Mission Control Logo"
            />
          </div>
          <h2 className="text-4xl font-bold text-purple-300">
            Discosat Operations
          </h2>
          <p className="text-space-subtext text-lg">
            Access your flight planning dashboard
          </p>
        </div>

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

        <p className="text-center text-space-subtext mt-6">
          Need help? Contact{" "}
          <a
            href="#"
            className="text-purple-300 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            support
          </a>
        </p>
      </div>
    </div>
  );
}
