"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type IoTData = {
  heart_rate: number;
  resistance_level: number;
  rpm: number;
  calories_burned_per_min: number;
  machine_status: string;
};

export default function SmartGymPage() {
  const [iotData, setIotData] = useState<IoTData | null>(null);
  const [goal, setGoal] = useState("Build Muscle");
  const [location, setLocation] = useState("Downtown");
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to mock IoT websocket
    wsRef.current = new WebSocket("ws://localhost:8000/ws/iot");

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setIotData(data);
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const fetchRecommendations = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, location }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 relative overflow-hidden">
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-6xl mx-auto z-10 relative">
        <Link href="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-8 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>

        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            Smart Gym Assistant
          </h1>
          <p className="text-slate-400 text-lg">Live IoT equipment telemetry and personalized gym recommendations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* IoT Live Dashboard */}
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 text-emerald-400 mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Live Equipment Telemetry
            </h2>
            
            {iotData ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm mb-2">Heart Rate</p>
                  <p className="text-4xl font-black text-rose-500">{iotData.heart_rate} <span className="text-base text-slate-500 font-normal">bpm</span></p>
                </div>
                <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm mb-2">Resistance</p>
                  <p className="text-4xl font-black text-amber-500">Lvl {iotData.resistance_level}</p>
                </div>
                <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm mb-2">RPM</p>
                  <p className="text-4xl font-black text-cyan-400">{iotData.rpm}</p>
                </div>
                <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm mb-2">Calories/Min</p>
                  <p className="text-4xl font-black text-fuchsia-400">{iotData.calories_burned_per_min}</p>
                </div>
                <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center flex items-center justify-center text-emerald-400 font-medium">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping mr-3"></div>
                  Machine Status: {iotData.machine_status}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                 Connecting to smart equipment...
              </div>
            )}
          </div>

          {/* Recommendations Engine */}
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              AI Recommender
            </h2>
            
            <form onSubmit={fetchRecommendations} className="flex space-x-4 mb-6">
               <select 
                  value={goal} 
                  onChange={e => setGoal(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 flex-grow"
               >
                 <option value="Build Muscle">Build Muscle</option>
                 <option value="Lose Weight">Lose Weight</option>
                 <option value="Maintain Weight">Maintain Weight</option>
               </select>
               <button 
                  type="submit"
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-6 py-2 rounded-lg transition-all"
               >
                 Update
               </button>
            </form>

            <div className="flex-grow overflow-y-auto space-y-6 pr-2">
              {recommendations && (
                <>
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">Recommended Gyms</h3>
                    <div className="space-y-3">
                      {recommendations.gyms.map((gym: any, i: number) => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-white font-semibold">{gym.name}</h4>
                            <span className="text-amber-400 text-sm flex items-center">⭐ {gym.rating}</span>
                          </div>
                          <p className="text-sm text-slate-400">{gym.type} • {gym.distance}</p>
                          <div className="flex space-x-2 mt-3">
                            {gym.features.map((f: string, j: number) => (
                              <span key={j} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md">{f}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">Suggested Programs</h3>
                    <div className="space-y-3">
                      {recommendations.programs.map((prog: any, i: number) => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-semibold">{prog.title}</h4>
                            <p className="text-sm text-slate-400">{prog.duration} • {prog.focus}</p>
                          </div>
                          <span className="text-xs bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full font-medium border border-teal-500/30">
                            {prog.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
