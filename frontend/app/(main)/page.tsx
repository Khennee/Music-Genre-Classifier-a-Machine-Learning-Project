"use client";

import React, { useState } from 'react';
import { Upload, Music, BarChart3, ShieldCheck } from 'lucide-react';

export default function MusicGenrePage() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Navbar Placeholder */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Music size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">VibeCheck <span className="text-purple-500">AI</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#" className="hover:text-white transition-colors">Dataset</a>
            <a href="#" className="hover:text-white transition-colors">How it works</a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
            Instant Music Genre <br/> Classification
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload your audio files and let our deep learning model analyze the frequencies to detect the genre with high precision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Upload Area */}
          <div className="lg:col-span-7 space-y-6">
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4
                ${dragActive ? 'border-purple-500 bg-purple-500/5 scale-[1.02]' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}
              `}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${dragActive ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Drop your audio here</p>
                <p className="text-sm text-slate-500">Supports .mp3 and .wav (Max 10MB)</p>
              </div>
              <button className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors">
                Browse Files
              </button>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <BarChart3 size={18}/>, label: 'MFCC Analysis' },
                { icon: <ShieldCheck size={18}/>, label: '90%+ Accuracy' },
                { icon: <Music size={18}/>, label: '10+ Genres' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-2 text-xs text-slate-400">
                  <span className="text-purple-500">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Prediction Placeholder */}
          <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-3xl p-8 sticky top-28">
            <h3 className="text-xl font-bold mb-6">Classification Result</h3>
            
            {/* Placeholder Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center border border-white/5 rounded-2xl bg-black/20">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-slate-600">
                ?
              </div>
              <p className="text-sm text-slate-500 max-w-[200px]">
                Upload a file to see the AI prediction and confidence score.
              </p>
            </div>

            {/* Hint Box */}
            <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs leading-relaxed">
              <strong>Tip:</strong> The model works best with 30-second clips. If you upload a full song, we&apos;ll analyze the middle portion for you.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}