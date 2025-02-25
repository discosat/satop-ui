"use client";

import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  ChangeEvent,
} from "react";
import ReactFlow, {
  Background,
  Controls,
  Position,
  Node,
  NodeProps,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  XYPosition,
  addEdge,
  MarkerType,
  Handle,
} from "reactflow";

import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Timer,
  Repeat,
  Camera,
  SplitSquareVertical,
  CircuitBoard,
  Code,
  Plus,
  Trash2,
} from "lucide-react";
import { BaseNode } from "@/components/base-node";
import { DevTools } from "@/components/devtools";

type BlockType =
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
  values: Record<string, string | number | boolean>;
  childCount: number;
}

interface ProgramBlockProps extends NodeProps<BlockData> {
  data: BlockData;
  updateNodeData: (nodeId: string, data: Partial<BlockData>) => void;
}

// Interface for the program output format
interface BlockOutput {
  name: string;
  [key: string]: any;
}

interface BlockWithBody extends BlockOutput {
  body?: BlockOutput[];
}

type BlockTypes = {
  [K in BlockType]: BlockDefinition;
};

// Define block types that match the CSP parser
const blockTypes: BlockTypes = {
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

// Custom styled handle component
const StyledHandle = ({
  type,
  position,
  id,
  title,
  isConnectable = true,
  className = "",
}) => {
  const baseStyle =
    "w-3 h-3 rounded-full bg-white border-2 flex items-center justify-center";
  const positionStyles = {
    [Position.Top]: "top-0 -translate-y-1/2",
    [Position.Bottom]: "bottom-0 translate-y-1/2",
    [Position.Left]: "left-0 -translate-x-1/2",
    [Position.Right]: "right-0 translate-x-1/2",
  };

  return (
    <div className={`absolute ${positionStyles[position]} group`}>
      <Handle
        type={type}
        position={position}
        id={id}
        isConnectable={isConnectable}
        className={`${baseStyle} ${className}`}
      />
      {title && (
        <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap z-10">
          {title}
        </div>
      )}
    </div>
  );
};

// Program Block Component
const ProgramBlock = React.memo(
  ({ selected, data, id, updateNodeData }: ProgramBlockProps) => {
    // Handle input changes
    const handleInputChange = (
      e: ChangeEvent<HTMLInputElement>,
      inputName: string
    ) => {
      const value =
        e.target.type === "number"
          ? e.target.value === ""
            ? ""
            : Number(e.target.value)
          : e.target.value;

      const updatedValues = {
        ...data.values,
        [inputName]: value,
      };

      updateNodeData(id, { values: updatedValues });
    };

    return (
      <div
        className={`${data.color} rounded-lg p-4 text-white min-w-[200px] ${
          selected ? "ring-2 ring-white" : ""
        }`}
      >
        {/* Input handle at the top */}
        <StyledHandle
          type="target"
          position={Position.Top}
          id="in"
          title="Connect from parent block"
          className="border-blue-500"
        />

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
              value={
                data.values[input.name] !== undefined
                  ? data.values[input.name]
                  : ""
              }
              onChange={(e) => handleInputChange(e, input.name)}
            />
          ))}
        </div>

        {/* Output handle at the bottom for all blocks */}
        <StyledHandle
          type="source"
          position={Position.Bottom}
          id="out"
          title="Connect to next block"
          className="border-green-500"
        />

        {/* Child handle on the right side only for blocks that can have children */}
        {data.canHaveChildren && (
          <StyledHandle
            type="source"
            position={Position.Right}
            id="child"
            title="Connect to child block"
            className="border-purple-500"
          />
        )}
      </div>
    );
  }
);
ProgramBlock.displayName = "ProgramBlock";

const BlockProgramming: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [programOutput, setProgramOutput] = useState<BlockWithBody | null>(
    null
  );

  // Function to update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<BlockData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const nodeTypes = useMemo(
    () => ({
      programBlock: (props: NodeProps<BlockData>) => (
        <ProgramBlock {...props} updateNodeData={updateNodeData} />
      ),
    }),
    [updateNodeData]
  );

  // Validation function for connections
  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Get source and target nodes
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // Check connection types
      if (connection.sourceHandle === "child") {
        // Check if source can have children
        if (!sourceNode.data.canHaveChildren) return false;

        // Check if source has reached max children
        if (
          sourceNode.data.maxChildren !== undefined &&
          sourceNode.data.childCount >= sourceNode.data.maxChildren
        ) {
          return false;
        }

        // Check if target already has a parent
        const targetHasParent = edges.some(
          (edge) => edge.target === targetNode.id && edge.targetHandle === "in"
        );

        if (targetHasParent) return false;

        return true;
      } else if (connection.sourceHandle === "out") {
        // Sequential connection - make sure the target doesn't already have a connection
        const targetHasSequentialParent = edges.some(
          (edge) =>
            edge.target === targetNode.id &&
            edge.targetHandle === "in" &&
            edge.sourceHandle === "out"
        );

        if (targetHasSequentialParent) return false;

        return true;
      }

      return false;
    },
    [nodes, edges]
  );

  // Update child count when edges change
  useEffect(() => {
    const nodeChildCounts = nodes.reduce((acc, node) => {
      // Count child connections (only from 'child' handle)
      const childCount = edges.filter(
        (edge) => edge.source === node.id && edge.sourceHandle === "child"
      ).length;

      acc[node.id] = childCount;
      return acc;
    }, {} as Record<string, number>);

    // Update nodes with new child counts
    setNodes((nodes) =>
      nodes.map((node) => {
        if (
          nodeChildCounts[node.id] !== undefined &&
          nodeChildCounts[node.id] !== node.data.childCount
        ) {
          return {
            ...node,
            data: {
              ...node.data,
              childCount: nodeChildCounts[node.id],
            },
          };
        }
        return node;
      })
    );
  }, [edges, setNodes]);

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

      // Initialize with empty values object
      const initialValues: Record<string, string | number | boolean> = {};

      // Pre-populate with default empty values for each input
      blockTypes[type].inputs.forEach((input) => {
        initialValues[input.name] = input.type === "number" ? "" : "";
      });

      const newNode: Node<BlockData> = {
        id: `${type}-${Date.now()}`,
        type: "programBlock",
        position,
        data: {
          type,
          values: initialValues,
          childCount: 0,
          ...blockTypes[type],
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) {
        console.warn("Invalid connection attempt", params);
        return;
      }

      const newEdge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        type: "smoothstep",
        animated: params.sourceHandle === "child",
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, isValidConnection]
  );

  // Helper function to get node descendants (for sequential flow)
  const getSequentialDescendants = useCallback(
    (nodeId: string): string[] => {
      const childEdges = edges.filter(
        (edge) => edge.source === nodeId && edge.sourceHandle === "out"
      );

      if (childEdges.length === 0) return [];

      const childNodeId = childEdges[0].target;
      return [childNodeId, ...getSequentialDescendants(childNodeId)];
    },
    [edges]
  );

  // Helper function to get node children (for parent-child relationship)
  const getBlockChildren = useCallback(
    (nodeId: string): string[] => {
      const childEdges = edges.filter(
        (edge) => edge.source === nodeId && edge.sourceHandle === "child"
      );

      return childEdges.map((edge) => edge.target);
    },
    [edges]
  );

  // Function to build a block's body recursively
  const buildBlockBody = useCallback(
    (nodeId: string): BlockOutput[] => {
      const children = getBlockChildren(nodeId);
      const bodyBlocks: BlockOutput[] = [];

      for (const childId of children) {
        const node = nodes.find((n) => n.id === childId);
        if (!node) continue;

        // Create the child block
        const childBlock = createBlockOutput(node);

        // Add its sequential descendants
        const sequentialBlockIds = getSequentialDescendants(childId);
        let currentBlock = childBlock;

        // If this child has a body, add it
        if (node.data.canHaveChildren) {
          currentBlock.body = buildBlockBody(childId);
        }

        bodyBlocks.push(currentBlock);

        // Process sequential blocks
        for (const seqId of sequentialBlockIds) {
          const seqNode = nodes.find((n) => n.id === seqId);
          if (!seqNode) continue;

          const seqBlock = createBlockOutput(seqNode);

          // If this sequential block has a body, add it
          if (seqNode.data.canHaveChildren) {
            seqBlock.body = buildBlockBody(seqId);
          }

          bodyBlocks.push(seqBlock);
        }
      }

      return bodyBlocks;
    },
    [nodes, getBlockChildren, getSequentialDescendants]
  );

  // Helper function to create a block output from a node
  const createBlockOutput = useCallback(
    (node: Node<BlockData>): BlockOutput => {
      const output: BlockOutput = {
        name: node.data.type,
      };

      // Add input values
      node.data.inputs.forEach((input) => {
        const value = node.data.values[input.name];
        if (value !== undefined && value !== "") {
          output[input.name] = input.type === "number" ? Number(value) : value;
        }
      });

      return output;
    },
    []
  );

  // Generate the program output from nodes and edges
  const generateProgramOutput = useCallback(() => {
    // Find root nodes (nodes with no incoming edges to their 'in' handle)
    const rootNodeIds = nodes
      .filter(
        (node) =>
          !edges.some(
            (edge) => edge.target === node.id && edge.targetHandle === "in"
          )
      )
      .map((node) => node.id);

    if (rootNodeIds.length === 0) {
      setProgramOutput(null);
      return;
    }

    // Process each root node
    for (const rootId of rootNodeIds) {
      const rootNode = nodes.find((n) => n.id === rootId);
      if (!rootNode) continue;

      // Create the base output
      const output = createBlockOutput(rootNode);

      // If this block can have children, add body
      if (rootNode.data.canHaveChildren) {
        output.body = buildBlockBody(rootId);
      }

      // Add sequential blocks
      const sequentialBlockIds = getSequentialDescendants(rootId);
      if (sequentialBlockIds.length > 0) {
        // If we have a sequential flow, make this the root
        setProgramOutput(output);
        return;
      }

      // Otherwise, just set this block as the output
      setProgramOutput(output);
      return;
    }
  }, [
    nodes,
    edges,
    createBlockOutput,
    buildBlockBody,
    getSequentialDescendants,
  ]);

  // Update the program output whenever nodes or edges change
  useEffect(() => {
    generateProgramOutput();
  }, [nodes, edges, generateProgramOutput]);

  // Function to delete all nodes and edges
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  // Function to create an example program structured as specified
  const createExampleProgram = useCallback(() => {
    // Clear existing nodes and edges
    clearCanvas();

    // Step 1: Create all the nodes with proper values

    // Create the repeat-n node
    const repeatNode: Node<BlockData> = {
      id: "repeat-node",
      type: "programBlock",
      position: { x: 250, y: 50 },
      data: {
        type: "repeat-n",
        values: { count: 10 },
        childCount: 0,
        ...blockTypes["repeat-n"],
      },
    };

    // Create gpio-write ON node
    const gpioOnNode: Node<BlockData> = {
      id: "gpio-on-node",
      type: "programBlock",
      position: { x: 400, y: 50 },
      data: {
        type: "gpio-write",
        values: { pin: 16, value: 1 },
        childCount: 0,
        ...blockTypes["gpio-write"],
      },
    };

    // Create first wait node
    const wait1Node: Node<BlockData> = {
      id: "wait1-node",
      type: "programBlock",
      position: { x: 400, y: 150 },
      data: {
        type: "wait-sec",
        values: { duration: 1 },
        childCount: 0,
        ...blockTypes["wait-sec"],
      },
    };

    // Create gpio-write OFF node
    const gpioOffNode: Node<BlockData> = {
      id: "gpio-off-node",
      type: "programBlock",
      position: { x: 400, y: 250 },
      data: {
        type: "gpio-write",
        values: { pin: 16, value: 0 },
        childCount: 0,
        ...blockTypes["gpio-write"],
      },
    };

    // Create second wait node
    const wait2Node: Node<BlockData> = {
      id: "wait2-node",
      type: "programBlock",
      position: { x: 400, y: 350 },
      data: {
        type: "wait-sec",
        values: { duration: 1 },
        childCount: 0,
        ...blockTypes["wait-sec"],
      },
    };

    // Step 2: Add the nodes to the canvas
    setNodes([repeatNode, gpioOnNode, wait1Node, gpioOffNode, wait2Node]);

    // Step 3: Create edges to connect the nodes
    setTimeout(() => {
      // Connect repeat node to gpio-on as child
      const edge1: Edge = {
        id: "edge-repeat-to-gpio-on",
        source: "repeat-node",
        sourceHandle: "child",
        target: "gpio-on-node",
        targetHandle: "in",
        type: "smoothstep",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      // Connect gpio-on to wait1 sequentially
      const edge2: Edge = {
        id: "edge-gpio-on-to-wait1",
        source: "gpio-on-node",
        sourceHandle: "out",
        target: "wait1-node",
        targetHandle: "in",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      // Connect wait1 to gpio-off sequentially
      const edge3: Edge = {
        id: "edge-wait1-to-gpio-off",
        source: "wait1-node",
        sourceHandle: "out",
        target: "gpio-off-node",
        targetHandle: "in",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      // Connect gpio-off to wait2 sequentially
      const edge4: Edge = {
        id: "edge-gpio-off-to-wait2",
        source: "gpio-off-node",
        sourceHandle: "out",
        target: "wait2-node",
        targetHandle: "in",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      setEdges([edge1, edge2, edge3, edge4]);
    }, 100); // Small delay to ensure nodes are rendered first
  }, [clearCanvas, setNodes, setEdges]);

  // Help tooltip for the connection system
  const ConnectionHelp = () => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="font-bold text-lg mb-2">Connection Guide</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <span className="font-semibold">Top handle (blue):</span> Connect from
          a parent block or previous block
        </li>
        <li>
          <span className="font-semibold">Bottom handle (green):</span> Connect
          to the next sequential block
        </li>
        <li>
          <span className="font-semibold">Right handle (purple):</span> Connect
          to a child block (only on container blocks)
        </li>
      </ul>
      <p className="mt-2 text-sm text-gray-600">
        Hover over handles to see their function. For the sample program
        structure, first use the right handle of the Repeat block to connect to
        the first GPIO Write, then use the bottom handles to chain the remaining
        blocks in sequence.
      </p>
    </div>
  );

  const Toolbar = useMemo(
    () => (
      <div className="mb-4">
        <ConnectionHelp />

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex flex-wrap gap-2 flex-1">
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
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              onClick={createExampleProgram}
            >
              <Plus className="w-4 h-4" />
              <span>Load Example</span>
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              onClick={clearCanvas}
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>
    ),
    [createExampleProgram, clearCanvas]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>CSP Block Programming</CardTitle>
      </CardHeader>
      <CardContent>
        {Toolbar}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
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
                fitView
                maxZoom={1.5}
                minZoom={0.5}
                /* defaultZoom={1} */
                /* connectionLineType="smoothstep" */
                connectionLineStyle={{ stroke: "#888" }}
              >
                <Background />
                <DevTools position="top-left" />
                <Controls />
              </ReactFlow>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="p-4 bg-gray-100 rounded-lg h-full overflow-auto">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Program Output
              </h3>
              <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                {programOutput
                  ? JSON.stringify(programOutput, null, 4)
                  : "No valid program structure detected"}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockProgramming;
