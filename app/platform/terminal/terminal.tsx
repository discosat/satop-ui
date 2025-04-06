"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X, Minus, Square, Command, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    <Card
      className="w-full h-[calc(100vh-200px)] flex flex-col mx-auto overflow-hidden"
      onClick={focusInput}
    >
      <CardHeader className="p-2 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-sm text-muted-foreground">Terminal — zsh</div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
            >
              <Square className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <ScrollArea
        className="h-[calc(100%-40px)] bg-background"
        ref={scrollAreaRef}
      >
        <div className="p-4 min-h-full">
          <div className="whitespace-pre-wrap">
            {history.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes(" % ")
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              >
                {line}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center mt-1">
            <span className="text-primary">
              {username}@{hostname} {currentDirectory} %
            </span>
            <span className="ml-2 text-foreground flex-grow">
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none w-full text-foreground px-1 h-auto"
                autoFocus
                autoComplete="off"
                spellCheck="false"
              />
            </span>
          </form>
        </div>
      </ScrollArea>
      <CardFooter className="h-6 p-0 bg-muted/80 text-xs border-t">
        <div className="w-full flex justify-between items-center px-2">
          <div className="flex items-center">
            <Badge
              variant="outline"
              className="h-5 px-1 mr-2 border-primary/50"
            >
              <Command className="h-3 w-3 mr-1" />
              <span>{currentDirectory}</span>
            </Badge>
            <span className="text-muted-foreground">
              {username}@{hostname}
            </span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <span className="mr-2">utf-8</span>
            <ChevronRight className="h-3 w-3" />
            <span className="ml-2">{history.length} lines</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
