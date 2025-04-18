"use client";

import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';

const blockSnippets: { label: string; json: object; colorClass: string }[] = [
  { label: 'If Statement', json: { name: 'if', cond: '' }, colorClass: 'bg-blue-500 text-white' },
  { label: 'If-Else Statement', json: { name: 'ifelse', cond: '' }, colorClass: 'bg-blue-600 text-white' },
  { label: 'Wait (sec)', json: { name: 'wait-sec', duration: 0 }, colorClass: 'bg-yellow-500 text-white' },
  { label: 'Repeat N Times', json: { name: 'repeat-n', count: 1 }, colorClass: 'bg-green-500 text-white' },
  { label: 'GPIO Write', json: { name: 'gpio-write', pin: 0, value: 0 }, colorClass: 'bg-purple-500 text-white' },
  { label: 'Capture Image', json: { name: 'capture_image', cameraID: '', cameraType: '', exposure: 0, iso: 100, numOfImages: 1, interval: 0 }, colorClass: 'bg-red-500 text-white' },
];

export default function FlightPlanner() {
  const [data, setData] = useState<string>('[]');

  useEffect(() => {
    setData('[]');
  }, []);

  const insertSnippet = (snippet: object) => {
    let arr: object[];
    try {
      const parsed = JSON.parse(data);
      arr = Array.isArray(parsed) ? parsed : [];
    } catch {
      arr = [];
    }
    arr.push(snippet);
    setData(JSON.stringify(arr, null, 2));
  };

  const clearContent = () => setData('[]');

  const copyContent = () => {
    navigator.clipboard.writeText(data);
  };

  return (
    <Card className="w-full m-4">
      <CardContent className="p-4">
        {/* Buttons to add snippets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blockSnippets.map(({ label, json, colorClass }) => (
            <Button
              key={label}
              className={`${colorClass}`}
              onClick={() => insertSnippet(json)}
            >
              {label}
            </Button>
          ))}
          <Button variant="destructive" onClick={clearContent}>
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </Button>
        </div>

        {/* Editor and Viewer layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Editor pane */}
          <div className="lg:col-span-2">
            <div className="h-[calc(100vh-200px)] border rounded-lg overflow-hidden">
              <MonacoEditor
                height="100%"
                defaultLanguage="json"
                value={data}
                onChange={(value) => setData(value ?? '[]')}
                options={{
                  automaticLayout: true,
                  theme: 'vs-dark',
                  fontSize: 14,
                  minimap: { enabled: true },
                  wordWrap: 'on',
                  lineNumbers: 'on',
                }}
                onMount={(editor, monaco) => {
                  monaco.editor.setTheme('vs-dark');
                }}
              />
            </div>
          </div>

          {/* Viewer pane */}
          <div className="lg:col-span-1 relative">
            <div className="h-[calc(100vh-200px)] border rounded-lg p-4 overflow-auto">
              {data ? (
                <JSONPretty
                  data={
                    (() => {
                      try { return JSON.parse(data); } catch { return []; }
                    })()
                  }
                  themeClassName="monikai"
                />
              ) : (
                <p className="text-center text-gray-500">No data available</p>
              )}
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={copyContent}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
