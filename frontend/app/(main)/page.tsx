"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import AudioVisualizer from "@/components/AudioVisualizer";
import GenreResults from "@/components/GenreResult";
import { Music, Zap, Search, Sparkles, Disc, MoveRight, X, Radio } from "lucide-react";
import { ClassificationResults } from "@/types";
import { gsap } from "gsap";

export default function MusicGenrePage() {
    const [activeTab, setActiveTab] = useState<"main" | "classify">("main");
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<ClassificationResults | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

    const heroRef = useRef(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === "main") {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(heroRef.current, 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 1, delay: 0.2 }
            ).fromTo(cardsRef.current?.children || [],
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
                "-=0.5"
            );
        }
    }, [activeTab]);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setResults(null);
        setIsAnalyzing(true);
        setActiveTab("classify"); 

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("http://localhost:8000/predict", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Backend connection failed.");

            const data = await response.json();
            const rawPredictions = data.all_predictions;
            const T = 2.2; 
            
            const softenedEntries = Object.entries(rawPredictions).map(([genre, val]) => {
                const score = val as number; 
                return [genre, Math.pow(score, 1 / T)];
            });

            const newSum = softenedEntries.reduce((acc, [_, val]) => acc + (val as number), 0);
            const finalResults = Object.fromEntries(
                softenedEntries.map(([genre, val]) => [
                    genre, 
                    (val as number) / (newSum || 1)
                ])
            );

            setResults(finalResults as ClassificationResults);
            
        } catch (error) {
            console.error("BIT WAVE Engine Error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleClear = () => {
        setFile(null);
        setResults(null);
        setIsAnalyzing(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="max-w-[1600px] mx-auto px-6 pt-0 pb-6 lg:pb-10">
                {activeTab === "main" ? (
                    <div className="min-h-[70vh] flex flex-col items-center justify-center relative -mt-8">
                        {/* Background Accents */}
                        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#3b0764,transparent)]" />
                            <div className="grid grid-cols-12 gap-4 h-full w-full px-8">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                                ))}
                            </div>
                        </div>

                        <div ref={heroRef} className="relative z-10 text-center space-y-6 mb-12 mt-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-purple-400 uppercase tracking-[0.2em]">
                                <Sparkles size={12} />
                                Sonic Spectrum Analyzer
                            </div>
                            
                            <h1 className="text-7xl lg:text-9xl font-bold tracking-tighter italic leading-[1.0]">
                                BIT{" "}
                                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-600 pr-[0.15em] -mr-[0.15em]">
                                    WAVE
                                </span>
                            </h1>
                            
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg lg:text-xl font-light">
                                A Machine Learning Project about genre classification and distribution where we are looking at the entire spectrum of genres present in the track, much like a frequency visualizer looks at the entire spectrum of sound.
                            </p>
                            
                            <button 
                                onClick={() => setActiveTab("classify")}
                                className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                Launch Engine
                                <MoveRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div ref={cardsRef} className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                            <LandingCard icon={<Music size={24} />} title="Classification" desc="88.38% prediction accuracy across 16 genres." color="text-purple-500" />
                            <LandingCard icon={<Disc size={24} />} title="Spectral UI" desc="Low-latency frequency visualizers running at 60FPS." color="text-blue-500" />
                            <LandingCard icon={<Radio size={24} />} title="Secure Node" desc="Model inference happens locally on your machine." color="text-emerald-500" />
                        </div>
                    </div>
                ) : (
                    /* --- CLASSIFY TAB --- */
                    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 animate-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] mt-2">
                        
                        {/* LEFT COLUMN: FIXED STRUCTURE */}
                        <div className="flex flex-col gap-6 h-full overflow-hidden">
                            
                            {/* PERMANENT SIGNAL STATUS CONTAINER */}
                            <div className={`w-full flex items-center justify-between px-6 py-5 rounded-[2rem] border transition-all duration-500 ${
                                file 
                                ? "bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
                                : "bg-white/[0.02] border-white/5 opacity-40"
                            }`}>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${file ? "text-red-500" : "text-slate-500"}`}>
                                        {file ? "Signal Detected" : "No Active Signal"}
                                    </span>
                                    <span className={`text-xs font-mono truncate w-full mt-1 ${file ? "text-red-400" : "text-slate-600"}`}>
                                        {file ? file.name : "Waiting for input..."}
                                    </span>
                                </div>
                                
                                {file && (
                                    <button 
                                        onClick={handleClear}
                                        className="p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* NEURAL PREDICTIONS (SCROLLABLE AREA) */}
                            <div className="flex-1 bg-[#0d0d11] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex flex-col min-h-0 overflow-hidden">
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Neural Prediction</h3>
                                    <div className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-mono border border-purple-500/20 animate-pulse">LIVE</div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    {results ? <GenreResults results={results} /> : <LoadingPlaceholder isAnalyzing={isAnalyzing} />}
                                </div>
                            </div>

                            {/* EXPANDED UPLOADER */}
                            <div className="h-[220px] shrink-0">
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: VISUALIZER AREA */}
                        <div className="h-full">
                            {file ? (
                                <div className="relative h-full">
                                    <AudioVisualizer file={file} />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-[#0d0d11]/40 border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-700">
                                    <div className="p-8 rounded-full bg-white/[0.01] mb-6 border border-white/5">
                                        <Disc size={48} className="opacity-10 animate-[spin_10s_linear_infinite]" />
                                    </div>
                                    <p className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-30 text-center">Awaiting Audio Input Signal</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

/* --- SUB-COMPONENTS --- */

function LandingCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group cursor-default">
            <div className={`${color} mb-4 group-hover:scale-110 transition-transform duration-500`}>{icon}</div>
            <h3 className="font-bold mb-2 uppercase text-[10px] tracking-widest text-slate-300">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-light">{desc}</p>
        </div>
    );
}

function LoadingPlaceholder({ isAnalyzing }: { isAnalyzing: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 h-full text-center">
            <div className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 ${isAnalyzing ? 'animate-spin border-t-purple-500' : 'text-slate-700'}`}>
                {isAnalyzing ? <Zap size={20} className="text-purple-500 fill-purple-500" /> : <Search size={20} />}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 px-8 leading-loose">
                {isAnalyzing ? "Analyzing Frequency Spectrum..." : "Initialize Engine by Uploading a Track"}
            </p>
        </div>
    );
}