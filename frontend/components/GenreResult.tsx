"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ClassificationResults } from "@/types";

interface GenreResultsProps {
    results: ClassificationResults;
}

export default function GenreResults({ results }: GenreResultsProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Sort results to show highest probability first and slice to Top 5
    const sortedEntries = Object.entries(results)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); 

    useEffect(() => {
        if (containerRef.current) {
            const bars = containerRef.current.querySelectorAll(".result-bar");
            gsap.fromTo(bars,
                { width: "0%" },
                { 
                    width: (i, target) => (target as HTMLElement).dataset.width + "%", 
                    duration: 1.5, 
                    stagger: 0.1, 
                    ease: "elastic.out(1, 0.75)" 
                }
            );
        }
    }, [results]);

    return (
        <div ref={containerRef} className="space-y-5">
            {sortedEntries.map(([genre, probability]) => {
                const percentage = Math.round(probability * 100);
                
                return (
                    <div key={genre} className="space-y-2 group">
                        <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                            <span className="text-slate-400 group-hover:text-white transition-colors">{genre}</span>
                            <span className="text-purple-400">{percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="result-bar h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                data-width={percentage.toString()}
                                style={{ width: "0%" }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}