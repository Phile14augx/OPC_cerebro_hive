'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface PromptEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
}

export function PromptEditor({ value, onChange, language = 'plaintext', readOnly = false }: PromptEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (monaco) {
      // Custom language support for basic prompt highlighting
      monaco.languages.register({ id: 'promptLang' });
      monaco.languages.setMonarchTokensProvider('promptLang', {
        tokenizer: {
          root: [
            [/\{\{.*?\}\}/, 'variable'], // Highlight {{var}}
          ]
        }
      });
      
      monaco.editor.defineTheme('promptTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'variable', foreground: '569CD6', fontStyle: 'bold' } // Blue color for variables
        ],
        colors: {
          'editor.background': '#00000000' // transparent to match IDE theme
        }
      });
    }
  }, [monaco]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="w-full h-full relative">
      <Editor
        height="100%"
        language={language === 'plaintext' ? 'promptLang' : language}
        theme="promptTheme"
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          wordWrap: 'on',
          readOnly,
          padding: { top: 16 },
          fontSize: 14,
          fontFamily: 'var(--font-jetbrains)',
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
