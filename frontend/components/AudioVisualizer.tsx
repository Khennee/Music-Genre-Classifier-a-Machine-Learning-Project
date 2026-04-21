"use client";
import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";

export default function AudioVisualizer({ file }: { file: File }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#cbd5e1",
      progressColor: "#3b82f6",
      cursorColor: "#3b82f6",
      barWidth: 2,
      barRadius: 3,
      // responsive: true,  <-- DELETE THIS LINE
      height: 100,
    });

    ws.loadBlob(file);

    // Optional: Add a listener to update the Play/Pause state
    // if the user clicks directly on the waveform to play
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    waveSurferRef.current = ws;

    return () => ws.destroy();
  }, [file]);

  const togglePlay = () => {
    waveSurferRef.current?.playPause();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div ref={containerRef} />
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        {isPlaying ? "Pause" : "Play Preview"}
      </button>
    </div>
  );
}
