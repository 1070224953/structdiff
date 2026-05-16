import { useRef, useState } from 'react';
import type { DragEvent } from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export default function EditorPanel({ label, value, onChange, error }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <span>{label}</span>
        <button
          className="load-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Load .json / .yaml / .yml file"
        >
          📂 Load file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yaml,.yml,.txt"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) loadFile(file);
            e.target.value = '';
          }}
        />
      </div>
      <textarea
        className={`editor-textarea${dragOver ? ' drag-over' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        placeholder={`Paste or drop ${label} file here…`}
        spellCheck={false}
      />
      {error && <div className="editor-error">{error}</div>}
    </div>
  );
}
