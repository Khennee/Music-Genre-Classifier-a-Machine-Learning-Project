"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Upload, Music, Disc, ShieldCheck, Sparkles, MoveRight } from "lucide-react";
import AudioVisualizer from "./AudioVisualizer"; // Ensure the path matches your file structure

export default function LandingPage() {
    const [file, setFile] = useState<File | null>(null);
    const heroRef = useRef(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const uploadZoneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(heroRef.current, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1, delay: 0.2 }
        )
        .fromTo(uploadZoneRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.8 },
            "-=0.5"
        )
        .fromTo(cardsRef.current?.children || [],
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
            "-=0.3"
        );
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    if (file) {
        return (
            <div className="min-h-screen bg-[#050507] p-4 lg:p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-6xl h-[800px]">
                    <button 
                        onClick={() => setFile(null)}
                        className="mb-6 text-slate-500 hover:text-white flex items-center gap-2 transition-colors group"
                    >
                        <MoveRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} />
                        Back to Upload
                    </button>
                    <AudioVisualizer file={file} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050507] text-white overflow-hidden selection:bg-purple-500/30">
            {/* Background Decorative Waveform Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#3b0764,transparent)]" />
                <div className="grid grid-cols-12 gap-4 h-full w-full px-8">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    ))}
                </div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center">
                {/* Hero Header */}
                <div ref={heroRef} className="text-center mb-16 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-purple-400 uppercase tracking-tighter">
                        <Sparkles size={12} />
                        Next-Gen Spectral Analysis
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter italic">
                        BISCOCHO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-600">SOUND</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg lg:text-xl font-light">
                        Classify, visualize, and analyze your audio assets with our proprietary high-fidelity neural engine.
                    </p>
                </div>

                {/* GSAP Upload Zone */}
                <div 
                    ref={uploadZoneRef}
                    className="w-full max-w-3xl group relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                    
                    <label className="relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-[#0d0d11]/80 backdrop-blur-xl hover:bg-[#12121a]/80 hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="p-4 bg-purple-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                                <Upload className="text-purple-400" size={32} />
                            </div>
                            <p className="text-xl font-medium mb-2">Drop your soundscape here</p>
                            <p className="text-slate-500 text-sm font-mono">WAV, MP3, or AIFF up to 50MB</p>
                        </div>
                        <input type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
                        
                        {/* Animated background bar inside zone */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                    </label>
                </div>

                {/* Feature Cards */}
                <div 
                    ref={cardsRef}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24"
                >
                    <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                        <Music className="text-purple-500 mb-4" size={24} />
                        <h3 className="font-bold mb-2 uppercase text-xs tracking-widest text-slate-300">Classification</h3>
                        <p className="text-slate-500 text-sm">Real-time genre prediction using deep-layered MFCC feature extraction.</p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                        <Disc className="text-blue-500 mb-4" size={24} />
                        <h3 className="font-bold mb-2 uppercase text-xs tracking-widest text-slate-300">Spectral UI</h3>
                        <p className="text-slate-500 text-sm">High-performance audio visualizers running at 60FPS with zero latency.</p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                        <ShieldCheck className="text-emerald-500 mb-4" size={24} />
                        <h3 className="font-bold mb-2 uppercase text-xs tracking-widest text-slate-300">Security</h3>
                        <p className="text-slate-500 text-sm">Local processing ensures your creative assets never leave the browser.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}