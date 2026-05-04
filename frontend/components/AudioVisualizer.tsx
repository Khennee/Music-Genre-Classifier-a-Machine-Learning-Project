"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, RotateCcw, Activity, Zap } from "lucide-react";
import { gsap } from "gsap";

interface AudioVisualizerProps {
  file: File;
}

interface ExtendedWindow extends Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
}

export default function AudioVisualizer({ file }: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const intensityRef = useRef(0);
  const hueRef = useRef(270);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const rightBarRef = useRef<HTMLDivElement>(null);
  const intensityTextRef = useRef<HTMLSpanElement>(null);

  // Kept only the bar graph canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Hue cycling for visual flair
  useEffect(() => {
    if (!isPlaying) return;
    const colorCycle = gsap.to({}, {
      duration: 10,
      repeat: -1,
      onUpdate: () => { hueRef.current = (hueRef.current + 1) % 360; }
    });
    return () => { colorCycle.kill(); };
  }, [isPlaying]);

  const drawVisualizer = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!wavesurferRef.current || !wavesurferRef.current.isPlaying()) {
        ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      
      // Calculate intensity for the glow bars
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      intensityRef.current = Math.min(avg / 90, 1);
      const intensity = intensityRef.current;
      const hue = hueRef.current;

      if (intensityTextRef.current) intensityTextRef.current.innerText = `${Math.round(intensity * 100)}%`;

      // Update Side Glow Bars
      const barH = 40 + (intensity * 240);
      gsap.set([leftBarRef.current, rightBarRef.current], {
        height: barH,
        backgroundColor: `hsla(${hue}, 80%, 60%, 1)`,
        boxShadow: `0 0 30px hsla(${hue}, 80%, 60%, 0.6)`
      });

      if (!ctx || !canvas) return;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Draw Symmetrical Bar Graph
      const centerX = width / 2;
      const barCount = 45; // Bars per side
      const barWidth = (width / 2) / barCount;
      const colorHue = (hue + 30) % 360;

      ctx.fillStyle = `hsla(${colorHue}, 80%, 60%, 0.7)`;

      for (let i = 0; i < barCount; i++) {
        // Use lower frequency data for more "movement" in the bars
        const val = dataArray[i * 2];
        const bH = (val / 255) * height * 1.2 * intensity;
        
        // Draw Right
        ctx.fillRect(centerX + (i * barWidth), height - bH, barWidth - 3, bH);
        // Draw Left (Mirror)
        ctx.fillRect(centerX - (i * barWidth) - barWidth, height - bH, barWidth - 3, bH);
      }

      animationRef.current = requestAnimationFrame(render);
    };
    render();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !file) return;

    const url = URL.createObjectURL(file);
    let isDestroyed = false;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(255, 255, 255, 0.05)",
      progressColor: "#a855f7",
      cursorColor: "#ffffff",
      barWidth: 2,
      barGap: 3,
      barRadius: 4,
      height: 100,
      normalize: true,
      backend: 'MediaElement',
    });

    wavesurferRef.current = ws;

    ws.on("ready", async () => {
      if (isDestroyed) return;
      setIsReady(true);
      
      const media = ws.getMediaElement();
      if (!media) return;
      media.crossOrigin = "anonymous";

      if (!audioCtxRef.current) {
        const win = window as unknown as ExtendedWindow;
        audioCtxRef.current = new (win.AudioContext || win.webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (sourceRef.current) sourceRef.current.disconnect();

      const source = ctx.createMediaElementSource(media);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      source.connect(analyser);
      analyser.connect(ctx.destination);

      sourceRef.current = source;
      analyserRef.current = analyser;

      try {
        if (ctx.state === 'suspended') await ctx.resume();
      } catch (e) {
        console.warn("AudioContext resume failed", e);
      }
    });

    ws.load(url).catch(err => {
      // Silence AbortErrors as they are expected during fast re-renders
      if (err.name === 'AbortError') return;
      console.error("Inference Load Error:", err);
    });

    ws.on("play", () => {
      setIsPlaying(true);
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      drawVisualizer();
    });

    ws.on("pause", () => setIsPlaying(false));

    return () => {
      isDestroyed = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      ws.destroy();
      URL.revokeObjectURL(url);
    };
  }, [file, drawVisualizer]);

  return (
    <div className="w-full bg-[#0d0d11] border border-white/5 rounded-[2.5rem] overflow-hidden p-8 h-full flex flex-col justify-between relative shadow-2xl">
      <style jsx>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            display: inline-flex;
            animation: marquee 15s linear infinite;
        }
      `}</style>

      {/* Top Bar */}
      <div className="flex items-center justify-between z-30 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if (audioCtxRef.current?.state === 'suspended') await audioCtxRef.current.resume();
              wavesurferRef.current?.playPause();
            }}
            disabled={!isReady}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95 ${!isReady ? "bg-white/5 opacity-50" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
          >
            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} className="ml-1" fill="white" />}
          </button>
          <button onClick={() => wavesurferRef.current?.stop()} className="p-3 text-slate-500 hover:text-white transition-colors"><RotateCcw size={18} /></button>
        </div>

        <div className="text-center hidden md:block w-full max-w-[240px] px-4 overflow-hidden">
          <p className="text-[10px] font-mono text-purple-500 uppercase tracking-widest mb-1">Bit Wave Analysis</p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-xs font-bold text-slate-300 px-4">{file.name}</span>
              <span className="text-xs font-bold text-slate-300 px-4">{file.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
          <Zap size={14} className="text-purple-500" />
          <span ref={intensityTextRef} className="text-[10px] font-mono text-white min-w-[30px]">0%</span>
        </div>
      </div>

      {/* Side Visualizers */}
      <div className="absolute left-0 top-0 bottom-0 w-1 flex items-center justify-center z-20">
        <div ref={leftBarRef} className="w-full rounded-full transition-all duration-75" />
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-1 flex items-center justify-center z-20">
        <div ref={rightBarRef} className="w-full rounded-full transition-all duration-75" />
      </div>

      {/* Waveform Section */}
      <div className="relative flex flex-col justify-center flex-grow py-8 z-10">
        {!isReady && <div className="absolute inset-0 flex items-center justify-center z-20"><Activity size={32} className="text-white/10 animate-pulse" /></div>}
        <div className="w-full max-w-5xl mx-auto px-6">
            <div ref={containerRef} className="w-full [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]" />
        </div>
      </div>

      {/* Single Bar Graph Visualizer */}
      <div className="pt-6 border-t border-white/5 relative z-20">
        <div className="max-w-5xl mx-auto px-6">
            <canvas ref={canvasRef} width={1000} height={80} className="w-full h-20 opacity-80" />
        </div>
      </div>
    </div>
  );
}