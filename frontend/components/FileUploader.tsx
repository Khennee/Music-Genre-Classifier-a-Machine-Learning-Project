"use client";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Music } from "lucide-react";

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) onFileSelect(acceptedFiles[0]);
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "audio/*": [".mp3", ".wav"] },
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={`group relative h-full border-2 border-dashed rounded-[2rem] p-8 transition-all duration-500 cursor-pointer text-center flex flex-col items-center justify-center
            ${isDragActive ? "border-purple-500 bg-purple-500/10 scale-[0.99]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"}`}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
                <div className={`p-5 rounded-3xl bg-white/[0.03] border border-white/10 group-hover:scale-110 transition-transform duration-500 ${isDragActive ? 'animate-bounce' : ''}`}>
                    {isDragActive ? <Music className="w-8 h-8 text-purple-400" /> : <Upload className="w-8 h-8 text-slate-500" />}
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-300">
                        {isDragActive ? "Release to Analyze" : "Drop Audio Track"}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-light">
                        MP3 / WAV Supported
                    </p>
                </div>
            </div>
        </div>
    );
}