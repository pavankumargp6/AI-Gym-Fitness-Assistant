import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse delay-1000"></div>

      <div className="z-10 text-center px-6 max-w-4xl">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500">
          UNLOX FITNESS
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          The ultimate AI ecosystem that understands, adapts, and enhances your fitness journey intelligently.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1 */}
          <Link href="/diet" className="group relative p-1 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 hover:from-cyan-400 hover:to-fuchsia-400 transition-all duration-300">
            <div className="h-full w-full bg-slate-900/90 backdrop-blur-xl rounded-xl p-8 border border-white/5 group-hover:bg-slate-900/70 transition-colors">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6 border border-cyan-500/30">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">AI Dietician</h3>
              <p className="text-slate-400 font-light">Your personal NLP-driven calorie coach. Get tailored diet plans and grocery lists instantly.</p>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/trainer" className="group relative p-1 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 hover:from-cyan-400 hover:to-fuchsia-400 transition-all duration-300">
            <div className="h-full w-full bg-slate-900/90 backdrop-blur-xl rounded-xl p-8 border border-white/5 group-hover:bg-slate-900/70 transition-colors">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6 border border-cyan-500/30">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white flex items-center justify-between">
                AI Gym Trainer
              </h3>
              <p className="text-slate-400 font-light">Real-time posture analysis and rep counting using computer vision.</p>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/buddy" className="group relative p-1 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 hover:from-purple-400 hover:to-pink-400 transition-all duration-300">
            <div className="h-full w-full bg-slate-900/90 backdrop-blur-xl rounded-xl p-8 border border-white/5 group-hover:bg-slate-900/70 transition-colors">
              <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white flex items-center justify-between">
                Virtual Gym Buddy
              </h3>
              <p className="text-slate-400 font-light">Chat with your AI companion. Tracks sentiment and predicts workout habits to keep you motivated.</p>
            </div>
          </Link>

          {/* Card 4 */}
          <Link href="/iot" className="group relative p-1 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all duration-300">
            <div className="h-full w-full bg-slate-900/90 backdrop-blur-xl rounded-xl p-8 border border-white/5 group-hover:bg-slate-900/70 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6 border border-emerald-500/30">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white flex items-center justify-between">
                Smart Gym & Planner
              </h3>
              <p className="text-slate-400 font-light">Live IoT equipment telemetry and personalized gym recommendations.</p>
            </div>
          </Link>

          {/* Card 5 */}
          <Link href="/dashboard" className="group relative p-1 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 hover:from-amber-400 hover:to-orange-400 transition-all duration-300 md:col-span-2">
            <div className="h-full w-full bg-slate-900/90 backdrop-blur-xl rounded-xl p-8 border border-white/5 group-hover:bg-slate-900/70 transition-colors flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
              <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6 md:mb-0 md:mr-6 border border-amber-500/30 shrink-0">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">Global Analytics Dashboard</h3>
                <p className="text-slate-400 font-light">Track your ultimate Performance Score. Combine insights from your diet, computer vision pose accuracy, and habits into one centralized view.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
