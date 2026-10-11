"use client";

import { useState } from "react";
import Link from "next/link";

export default function DietPage() {
  const [bmi, setBmi] = useState("");
  const [weightGoal, setWeightGoal] = useState("");
  const [preferences, setPreferences] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const response = await fetch("http://localhost:8000/api/diet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bmi: parseFloat(bmi),
          weight_goal: weightGoal,
          preferences: preferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch diet plan");
      }

      const data = await response.json();
      setPlan(data.plan);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl z-10">
        <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-8 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">
            AI Dietician & Calorie Coach
          </h1>
          <p className="text-slate-400 text-lg">Let AI craft the perfect diet plan tailored to your body and goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="md:col-span-5 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
              <svg className="w-6 h-6 text-fuchsia-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Your Profile
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Current BMI</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="e.g. 24.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Weight Goal</label>
                <select
                  required
                  value={weightGoal}
                  onChange={(e) => setWeightGoal(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none"
                >
                  <option value="" disabled>Select a goal</option>
                  <option value="Lose Weight">Lose Weight</option>
                  <option value="Maintain Weight">Maintain Weight</option>
                  <option value="Build Muscle">Build Muscle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Dietary Preferences</label>
                <textarea 
                  required
                  rows={3}
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                  placeholder="e.g. Vegetarian, no nuts, high protein..."
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Generating...
                  </span>
                ) : "Generate Diet Plan"}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="md:col-span-7 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
             <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
              <svg className="w-6 h-6 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Your AI Plan
            </h2>
            
            <div className="flex-grow bg-slate-950/50 rounded-xl border border-slate-800 p-6 overflow-y-auto max-h-[500px]">
              {error && (
                <div className="text-red-400 bg-red-400/10 p-4 rounded-lg border border-red-400/20">
                  {error}
                </div>
              )}
              
              {!plan && !error && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <p>Fill out your profile and click generate.</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-cyan-400">
                   <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <p className="mt-4 text-sm font-medium animate-pulse">The AI is analyzing your profile...</p>
                </div>
              )}

              {plan && (
                <div className="prose prose-invert prose-cyan max-w-none">
                  {plan.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 text-slate-300 leading-relaxed">
                      {line.startsWith('-') || line.startsWith('*') ? (
                        <span className="flex items-start">
                           <span className="text-fuchsia-400 mr-2">•</span>
                           <span>{line.replace(/^[-*]\s*/, '')}</span>
                        </span>
                      ) : line.match(/^#+\s/) ? (
                        <span className="block text-xl font-bold text-white mt-6 mb-3">{line.replace(/^#+\s*/, '')}</span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
