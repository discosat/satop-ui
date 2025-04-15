import BlockProgramming from "@/app/platform/flight/block";
import { ReactFlowProvider } from "@xyflow/react";

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Flight planning</h1>
      <ReactFlowProvider>
        <BlockProgramming />
      </ReactFlowProvider>
    </div>
  );
}
