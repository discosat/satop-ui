import Starfield from "../../components/starfield";
import ParticleBackground from "../../components/particle-background";
import Image from "next/image";
import { me } from "../actions/me";
import LoginForm from "./login-form";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await me();
  if (session) {
    redirect("/platform");
  }

  return (
    <div className="min-h-screen bg-space-image bg-cover bg-center flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <Starfield />
      <ParticleBackground />
      <div className="z-10 w-full max-w-md p-8 space-y-8 bg-space-card rounded-lg backdrop-blur-sm backdrop-filter border border-space-border shadow-space">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center my-12">
            <Image
              src="/assets/logo.png"
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

        <LoginForm />

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
