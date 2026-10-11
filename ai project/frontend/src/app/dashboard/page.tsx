"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, Target, Flame, Trophy } from "lucide-react";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/performance");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const radarData = data ? [
    { subject: 'Pose Accuracy', A: data.metrics.pose_accuracy, fullMark: 100 },
    { subject: 'Diet Adherence', A: data.metrics.diet_adherence, fullMark: 100 },
    { subject: 'Consistency', A: data.metrics.consistency, fullMark: 100 },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto z-10 relative">
        <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors mb-8 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>

        <div className="mb-10 flex flex-col md:flex-row justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
              Performance Analytics
            </h1>
            <p className="text-slate-400 text-lg">Your global fitness score, combining data from all AI modules.</p>
          </div>
          <div className="mt-6 md:mt-0 text-right">
             <p className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-1">Global Score</p>
             <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-orange-500">
               {data?.global_score}
             </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center">
             <div className="p-4 bg-cyan-500/20 rounded-xl mr-4">
               <Activity className="w-8 h-8 text-cyan-400" />
             </div>
             <div>
               <p className="text-slate-400 text-sm">Pose Accuracy</p>
               <p className="text-2xl font-bold text-white">{data?.metrics.pose_accuracy}%</p>
             </div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center">
             <div className="p-4 bg-green-500/20 rounded-xl mr-4">
               <Target className="w-8 h-8 text-green-400" />
             </div>
             <div>
               <p className="text-slate-400 text-sm">Diet Adherence</p>
               <p className="text-2xl font-bold text-white">{data?.metrics.diet_adherence}%</p>
             </div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center">
             <div className="p-4 bg-purple-500/20 rounded-xl mr-4">
               <Flame className="w-8 h-8 text-purple-400" />
             </div>
             <div>
               <p className="text-slate-400 text-sm">Consistency</p>
               <p className="text-2xl font-bold text-white">{data?.metrics.consistency}%</p>
             </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md p-6 rounded-2xl border border-amber-500/30 flex items-center shadow-[0_0_30px_rgba(245,158,11,0.15)]">
             <div className="p-4 bg-amber-500/30 rounded-xl mr-4">
               <Trophy className="w-8 h-8 text-amber-300" />
             </div>
             <div>
               <p className="text-amber-200/70 text-sm font-medium">Rank</p>
               <p className="text-2xl font-bold text-amber-400">Elite</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">7-Day Trend</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDiet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 100]} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="pose_accuracy" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorPose)" name="Pose Accuracy" />
                  <Area type="monotone" dataKey="diet_adherence" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#colorDiet)" name="Diet Adherence" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart Component Breakdown */}
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-white mb-2 self-start w-full">Skill Breakdown</h2>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="User" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
