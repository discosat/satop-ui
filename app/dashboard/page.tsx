import BlockProgramming from "../components/block2";
import { ReactFlowProvider } from "@xyflow/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discosat: Flight planing",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ReactFlowProvider>
        <BlockProgramming />
      </ReactFlowProvider>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {/*    <div className="aspect-video rounded-xl bg-muted/50 content-center text-center
 ">https://reactflow.dev</div>
            <div className="aspect-video rounded-xl bg-muted/50 content-center text-center " >https://github.com/nbudin/react-blockly</div>
            <div className="aspect-video rounded-xl bg-muted/50 content-center text-center">https://github.com/scratchfoundation/scratch-blocks</div>
          </div> */}
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}
