import BlockProgramming from "@/app/components/block";
import { ReactFlowProvider } from "@xyflow/react";

export default function Page() {
  return (
    <ReactFlowProvider>
      <BlockProgramming />
    </ReactFlowProvider>
  );
}
