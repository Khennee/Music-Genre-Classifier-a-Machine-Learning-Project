"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface GenreResultsProps {
  results: { [key: string]: number };
}

export default function GenreResults({ results }: GenreResultsProps) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.from(".result-bar", {
        width: 0,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
    { scope: container, dependencies: [results] }
  );

  return (
    <div
      ref={container}
      className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6"
    >
      <h3 className="text-xl font-bold text-slate-800">
        Classification Results
      </h3>
      <div className="space-y-5">
        {Object.entries(results).map(([genre, probability]) => (
          <div key={genre} className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span className="capitalize">{genre}</span>
              <span>{(probability * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="result-bar h-full bg-blue-500 rounded-full"
                style={{ width: `${probability * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
