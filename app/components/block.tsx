"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  Node,
  NodeProps,
  Connection,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  XYPosition,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Timer,
  Repeat,
  PenTool,
  Camera,
  SplitSquareVertical,
  CircuitBoard,
} from "lucide-react";

type BlockType =
  | "commands"
  | "if"
  | "ifelse"
  | "wait-sec"
  | "repeat-n"
  | "gpio-write"
  | "capture_image";

interface BlockInput {
  name: string;
  type: "number" | "text" | "boolean";
  placeholder: string;
  required: boolean;
}

interface BlockDefinition {
  name: string;
  color: string;
  icon: React.ReactNode;
  inputs: BlockInput[];
  canHaveChildren: boolean;
  maxChildren?: number;
}

interface BlockData extends BlockDefinition {
  type: BlockType;
  values: Record<string, BlockTypes>;
}

interface ProgramBlockProps extends NodeProps<BlockData> {
  data: BlockData;
}

type BlockTypes = {
  [K in BlockType]: BlockDefinition;
};

// Define block types that match the CSP parser
const blockTypes: BlockTypes = {
  commands: {
    name: "Command Sequence",
    color: "bg-gray-600",
    icon: <PenTool className="w-4 h-4" />,
    inputs: [],
    canHaveChildren: true,
  },
  if: {
    name: "If Statement",
    color: "bg-blue-500",
    icon: <SplitSquareVertical className="w-4 h-4" />,
    inputs: [
      { name: "cond", type: "text", placeholder: "Condition", required: true },
    ],
    canHaveChildren: true,
    maxChildren: 1,
  },
  ifelse: {
    name: "If-Else Statement",
    color: "bg-blue-600",
    icon: <SplitSquareVertical className="w-4 h-4" />,
    inputs: [
      { name: "cond", type: "text", placeholder: "Condition", required: true },
    ],
    canHaveChildren: true,
    maxChildren: 2,
  },
  "wait-sec": {
    name: "Wait",
    color: "bg-yellow-500",
    icon: <Timer className="w-4 h-4" />,
    inputs: [
      {
        name: "duration",
        type: "number",
        placeholder: "Duration (sec)",
        required: true,
      },
    ],
    canHaveChildren: false,
  },
  "repeat-n": {
    name: "Repeat N Times",
    color: "bg-green-500",
    icon: <Repeat className="w-4 h-4" />,
    inputs: [
      { name: "count", type: "number", placeholder: "Count", required: true },
    ],
    canHaveChildren: true,
  },
  "gpio-write": {
    name: "GPIO Write",
    color: "bg-purple-500",
    icon: <CircuitBoard className="w-4 h-4" />,
    inputs: [
      {
        name: "pin",
        type: "number",
        placeholder: "Pin number",
        required: true,
      },
      {
        name: "value",
        type: "number",
        placeholder: "Value (0/1)",
        required: true,
      },
    ],
    canHaveChildren: false,
  },
  capture_image: {
    name: "Capture Image",
    color: "bg-red-500",
    icon: <Camera className="w-4 h-4" />,
    inputs: [
      {
        name: "cameraID",
        type: "text",
        placeholder: "Camera ID",
        required: true,
      },
      {
        name: "cameraType",
        type: "text",
        placeholder: "Camera Type",
        required: true,
      },
      {
        name: "exposure",
        type: "number",
        placeholder: "Exposure",
        required: true,
      },
      { name: "iso", type: "number", placeholder: "ISO", required: true },
      {
        name: "numOfImages",
        type: "number",
        placeholder: "Number of Images",
        required: true,
      },
      {
        name: "interval",
        type: "number",
        placeholder: "Interval",
        required: true,
      },
    ],
    canHaveChildren: false,
  },
};

// Program Block Component
const ProgramBlock = React.memo(({ data }: ProgramBlockProps) => {
  return (
    <div className={`${data.color} rounded-lg p-4 text-white min-w-[200px]`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-bold">
          {data.icon}
          <span>{data.name}</span>
        </div>
        {data.inputs.map((input) => (
          <input
            key={input.name}
            type={input.type === "number" ? "number" : "text"}
            placeholder={input.placeholder}
            className="w-full px-2 py-1 rounded bg-white/20 text-white placeholder-white/50 text-sm"
            required={input.required}
          />
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

ProgramBlock.displayName = "ProgramBlock";

const nodeTypes = {
  programBlock: ProgramBlock,
};

const BlockProgramming: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as BlockType;
      if (!type || !blockTypes[type]) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position: XYPosition = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node<BlockData> = {
        id: `${type}-${Date.now()}`,
        type: "programBlock",
        position,
        data: {
          type,
          values: {},
          ...blockTypes[type],
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const Toolbar = useMemo(
    () => (
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(blockTypes).map(([type, block]) => (
          <div
            key={type}
            className={`${block.color} text-white px-4 py-2 rounded-lg flex items-center space-x-2 cursor-move`}
            draggable
            onDragStart={(event: React.DragEvent<HTMLDivElement>) => {
              event.dataTransfer.setData("application/reactflow", type);
              event.dataTransfer.effectAllowed = "move";
            }}
          >
            {block.icon}
            <span>{block.name}</span>
          </div>
        ))}
      </div>
    ),
    []
  );

  const [output, setOutput] = useState<string>("");

  useEffect(() => {
    const generateCSP = (): string => {
      const rootNodes = nodes.filter(
        (node) => !edges.some((edge) => edge.target === node.id)
      );

      const processNode = (node: Node<BlockData>): any => {
        const children = edges
          .filter((edge) => edge.source === node.id)
          .map((edge) => nodes.find((n) => n.id === edge.target))
          .filter((n): n is Node<BlockData> => !!n)
          .map(processNode);

        const baseStructure: any = {
          name: node.data.type,
          ...Object.fromEntries(
            Object.entries(node.data.values).filter(([_, v]) => v !== "")
          ),
        };

        if (children.length > 0) {
          baseStructure.body = children;
        }

        return baseStructure;
      };

      const outputData = rootNodes.map(processNode);
      return JSON.stringify(outputData, null, 2);
    };

    setOutput(generateCSP());
  }, [nodes, edges]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>CSP Block Programming</CardTitle>
      </CardHeader>
      <CardContent>
        {Toolbar}
        <div
          style={{ height: "600px" }}
          className="border rounded-lg bg-gray-50"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            connectionMode={ConnectionMode.Strict}
            fitView
            snapToGrid={true}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <div className="border rounded-lg bg-gray-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">CSP Output</h3>
          </div>
          <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-auto max-h-[520px]">
            {output}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockProgramming;
