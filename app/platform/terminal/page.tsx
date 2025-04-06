import Terminal from "@/app/platform/terminal/terminal";

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Terminal access</h1>
      <Terminal />
    </div>
  );
}
