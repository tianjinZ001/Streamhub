"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icons";

export function FileDropzone({
  name,
  multiple = true,
  large = false,
  hint,
  accept,
}: {
  name: string;
  multiple?: boolean;
  large?: boolean;
  hint: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  function syncFromInput() {
    setFiles(inputRef.current?.files ? Array.from(inputRef.current.files) : []);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (inputRef.current && e.dataTransfer.files.length) {
      inputRef.current.files = e.dataTransfer.files;
      syncFromInput();
    }
  }
  function removeFile(i: number) {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    files.forEach((f, idx) => {
      if (idx !== i) dt.items.add(f);
    });
    inputRef.current.files = dt.files;
    setFiles(Array.from(dt.files));
  }

  return (
    <>
      <div
        className={`dropzone${large ? " dropzone-lg" : ""}${dragging ? " drag" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {large ? (
          <>
            <Icon id="upload" className="ic dz-icon" />
            <div className="dz-main">
              <b>点击上传</b> 或拖拽文件到此
            </div>
            <div className="dz-hint">{hint}</div>
          </>
        ) : (
          <span>
            <b>点击上传</b> 或拖拽文件到此 —— {hint}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        multiple={multiple}
        accept={accept}
        hidden
        onChange={syncFromInput}
      />
      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => {
            const isImg = /^image\//.test(f.type);
            return (
              <span className="file-chip" key={i}>
                {isImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={URL.createObjectURL(f)} className="file-thumb" alt="" />
                ) : (
                  <span className="file-ico">{(f.name.split(".").pop() || "file").slice(0, 4).toUpperCase()}</span>
                )}
                <span className="file-name">{f.name}</span>
                <button type="button" className="file-x" onClick={() => removeFile(i)}>
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </>
  );
}
