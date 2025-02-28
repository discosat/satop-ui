"use client";

import { Button } from "@/components/ui/button";
import { logout } from "../actions/logout";

export default function ApplyForm() {
  async function handleSubmit() {}
  async function handleLogout() {
    await logout();
  }
  return (
    <>
      <Button
        className="w-full py-6 text-xl bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-glow-purple"
        onClick={handleSubmit}
      >
        Submit application
      </Button>
      <Button
        className="w-full py-6 text-xl bg-black-600  hover:bg-gray-700 hover:bg-opacity-100 text-white transition-all duration-300 ease-in-out transform hover:scale-105"
        onClick={handleLogout}
      >
        Login with other account
      </Button>
    </>
  );
}
