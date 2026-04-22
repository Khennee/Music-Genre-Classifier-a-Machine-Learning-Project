"use client";

import React from "react";
import { Music, Activity, LayoutGrid, Terminal } from "lucide-react";

interface HeaderProps {
    activeTab: "main" | "classify";
    setActiveTab: (tab: "main" | "classify") => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
    return (
        <nav className="sticky top-0 z-[100] w-full px-6 py-4">
            <div className="max-w-[1550px] mx-auto h-16 bg-[#0d0d11]/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] flex items-center justify-between px-6 shadow-2xl relative overflow-hidden">
                
                {/* 1. Logo & Signal Indicator */}
                <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => setActiveTab("main")}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500" />
                        <div className="relative w-10 h-10 bg-black rounded-xl border border-white/10 flex items-center justify-center">
                            <Music size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tighter leading-none">BITWAVE</span>
                        <div className="flex items-center gap-3 mt-1.5">
                            {/* MICRO FREQUENCY MONITOR */}
                            <div className="flex items-end gap-[2px] h-3">
                                <div className="w-[2px] bg-purple-500 rounded-full animate-[pulse-bar_0.6s_ease-in-out_infinite]" />
                                <div className="w-[2px] bg-purple-400 rounded-full animate-[pulse-bar_0.8s_ease-in-out_infinite_0.1s]" />
                                <div className="w-[2px] bg-purple-600 rounded-full animate-[pulse-bar_0.5s_ease-in-out_infinite_0.2s]" />
                                <div className="w-[2px] bg-purple-500 rounded-full animate-[pulse-bar_0.7s_ease-in-out_infinite_0.3s]" />
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Monitoring Signal
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Command Center Tabs */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white/[0.03] p-1.5 rounded-[1rem] border border-white/5 shadow-inner">
                    <TabButton 
                        active={activeTab === "main"} 
                        onClick={() => setActiveTab("main")}
                        icon={<LayoutGrid size={14} />}
                        label="Overview"
                    />
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <TabButton 
                        active={activeTab === "classify"} 
                        onClick={() => setActiveTab("classify")}
                        icon={<Activity size={14} />}
                        label="Classifier"
                    />
                </div>

                {/* 3. Utility / Status */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                        <Terminal size={14} className="text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-400 tracking-tighter">v1.0.4.stable</span>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    {/* User Signal Node */}
                    <div className="relative w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center overflow-hidden group">
                        <div className="absolute inset-0 bg-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <div className="relative w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" />
                    </div>
                </div>

                {/* THE AUDIO WAVE SCANLINE: A scanning line that moves across the bottom */}
                <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20 animate-[scan_3s_linear_infinite]" />
            </div>

            {/* Custom Animations - You can move these to your globals.css */}
            <style jsx>{`
                @keyframes pulse-bar {
                    0%, 100% { height: 4px; }
                    50% { height: 12px; }
                }
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </nav>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2.5 px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 relative group ${
                active 
                ? "text-white bg-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]" 
                : "text-slate-500 hover:text-slate-200"
            }`}
        >
            <span className={`${active ? "text-purple-400" : "text-slate-600 group-hover:text-slate-400"}`}>{icon}</span>
            {label}
            {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
            )}
        </button>
    );
}