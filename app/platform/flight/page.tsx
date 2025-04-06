import BlockProgramming from "@/app/platform/flight/block2";
import { ReactFlowProvider } from "@xyflow/react";

export default function Page() {
  return (
    <ReactFlowProvider>
      <BlockProgramming />
    </ReactFlowProvider>
  );
}
