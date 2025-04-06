"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { X, Minus, Square } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState("~");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const username = "user";
  const hostname = "localhost";

  useEffect(() => {
    // Focus the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Add welcome message
    setHistory([
      "Welcome to Terminal",
      "Type 'help' to see available commands",
      "",
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when history changes
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add command to history
    const newHistory = [
      ...history,
      `${username}@${hostname} ${currentDirectory} % ${input}`,
    ];

    // Process command
    const result = processCommand(input);

    // Add result to history
    setHistory([...newHistory, ...result, ""]);

    // Add to command history for up/down navigation
    setCommandHistory([...commandHistory, input]);
    setHistoryIndex(-1);

    // Clear input
    setInput("");
  };

  const processCommand = (cmd: string): string[] => {
    const command = cmd.trim().split(" ")[0];
    const args = cmd.trim().split(" ").slice(1);

    switch (command) {
      case "clear":
        setTimeout(() => setHistory([]), 0);
        return [];
      case "echo":
        return [args.join(" ")];
      case "ls":
        return ["Documents  Downloads  Pictures  Projects  .zshrc"];
      case "pwd":
        return [
          currentDirectory === "~"
            ? "/home/user"
            : `/home/user/${currentDirectory.replace("~", "")}`,
        ];
      case "cd":
        if (args.length === 0 || args[0] === "~") {
          setCurrentDirectory("~");
          return [""];
        } else {
          setCurrentDirectory(`~/${args[0]}`);
          return [""];
        }
      case "date":
        return [new Date().toString()];
      case "help":
        return [
          "Available commands:",
          "  clear - Clear the terminal",
          "  echo [text] - Display text",
          "  ls - List directory contents",
          "  pwd - Print working directory",
          "  cd [directory] - Change directory",
          "  date - Display current date and time",
          "  help - Display this help message",
        ];
      default:
        return [`zsh: command not found: ${command}`];
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Simple tab completion for demo purposes
      if (input.startsWith("cd ")) {
        const partial = input.substring(3);
        if ("Documents".startsWith(partial)) setInput("cd Documents");
        else if ("Downloads".startsWith(partial)) setInput("cd Downloads");
        else if ("Pictures".startsWith(partial)) setInput("cd Pictures");
        else if ("Projects".startsWith(partial)) setInput("cd Projects");
      }
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto h-[500px] rounded-lg overflow-hidden border border-purple-800 shadow-lg bg-[#1a1a1a] text-white font-mono"
      onClick={focusInput}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-purple-800">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm text-gray-400">Terminal — zsh</div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-400 hover:text-white"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-400 hover:text-white"
          >
            <Square className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <ScrollArea className="h-[calc(100%-40px)]" ref={scrollAreaRef}>
        <div className="p-4 min-h-full">
          {/* Command History */}
          <div className="whitespace-pre-wrap">
            {history.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes(" % ") ? "text-purple-300" : "text-gray-300"
                }
              >
                {line}
              </div>
            ))}
          </div>

          {/* Current Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center mt-1">
            <span className="text-purple-300">
              {username}@{hostname} {currentDirectory} %
            </span>
            <span className="ml-2 text-purple-100 flex-grow">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none w-full text-purple-100"
                autoFocus
                autoComplete="off"
                spellCheck="false"
              />
            </span>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
