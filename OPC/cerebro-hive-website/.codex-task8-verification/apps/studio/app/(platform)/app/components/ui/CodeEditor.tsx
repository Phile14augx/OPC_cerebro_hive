"use client";

import React from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
  theme?: "vs-dark" | "light";
}

export function CodeEditor({ language, value, onChange, height = "100%", theme = "vs-dark" }: CodeEditorProps) {
  const monaco = useMonaco();

  React.useEffect(() => {
    if (monaco) {
      // Define a custom theme that matches HivePulse's premium dark mode
      monaco.editor.defineTheme('hivepulse-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', fontStyle: 'italic', foreground: '6b7280' },
          { token: 'keyword', foreground: '818cf8' },
          { token: 'identifier', foreground: 'e5e7eb' },
          { token: 'string', foreground: '34d399' },
          { token: 'number', foreground: 'f472b6' },
        ],
        colors: {
          'editor.background': '#0a0a0a', // text-background
          'editor.foreground': '#e5e7eb', // text-primary
          'editorLineNumber.foreground': '#4b5563',
          'editor.selectionBackground': '#3730a380',
          'editor.lineHighlightBackground': '#171717',
          'editorCursor.foreground': '#818cf8',
          'editorIndentGuide.background': '#262626',
        }
      });
      monaco.editor.setTheme('hivepulse-dark');
    }
  }, [monaco]);

  return (
    <div className="w-full h-full border border-border rounded-lg overflow-hidden bg-background">
      <Editor
        height={height}
        language={language}
        value={value}
        theme="hivepulse-dark"
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineHeight: 24,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
        }}
        loading={
          <div className="flex items-center justify-center h-full w-full bg-background text-text-muted">
            Loading IDE workspace...
          </div>
        }
      />
    </div>
  );
}
