"use client";

import { ChangeEvent, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  accept?: string;
  fileHint?: string;
  onFileLoad?: (text: string) => string;
};

export function TextAreaWithUpload({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 6,
  accept = ".txt,.csv",
  fileHint = "TXT / CSV supported",
  onFileLoad,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onChange(onFileLoad ? onFileLoad(text) : text);
    if (fileRef.current) fileRef.current.value = "";
  }

  function clear() {
    onChange("");
  }

  const count = value
    ? value
        .split(/[\n\r]+/)
        .map((s) => s.trim())
        .filter(Boolean).length
    : 0;

  return (
    <div className="card p-5 animate-fade-in">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <label className="label !mb-0">{label}</label>
          {hint && <p className="text-xs text-slate-500">{hint}</p>}
       </div>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={clear}
              className="chip hover:bg-rose-100 hover:text-rose-700"
              title="Clear input"
            >
              <X size={12} /> Clear
           </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="chip hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Upload file"
          >
            <Upload size={12} /> Upload
         </button>
       </div>
     </div>
      <textarea
        className="textarea scrollbar-thin font-mono"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <FileText size={12} /> {count.toLocaleString()} entries
       </span>
        <span>{fileHint}</span>
     </div>
   </div>
  );
}
