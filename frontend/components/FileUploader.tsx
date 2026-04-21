"use client";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Music, FileAudio } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav"] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`group relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer text-center
        ${isDragActive ? "border-blue-500 bg-blue-50/50 scale-[1.01]" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
          {isDragActive ? (
            <Music className="w-8 h-8 text-blue-500 animate-bounce" />
          ) : (
            <Upload className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-700">
            {isDragActive ? "Drop to analyze" : "Upload your track"}
          </p>
          <p className="text-sm text-slate-500 mt-1">Drag & drop MP3 or WAV</p>
        </div>
      </div>
    </div>
  );
}
