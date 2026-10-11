"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function BuddyPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm your Virtual Gym Buddy. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSentiment, setLastSentiment] = useState<string>("Neutral");
  const [skipData, setSkipData] = useState<{skip_probability: number, nudge: string | null} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predict habit whenever sentiment changes
  useEffect(() => {
    const fetchHabitPrediction = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/habit/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             days_since_last_workout: 3, // hardcoded for demo
             current_sentiment: lastSentiment
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setSkipData(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHabitPrediction();
  }, [lastSentiment]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-5) // Send last 5 messages as context
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      setLastSentiment(data.sentiment);
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I'm having trouble connecting to the server right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10">
        <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-8 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[700px]">
          {/* Chat Section */}
          <div className="md:col-span-8 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
             <div className="p-6 border-b border-white/10 bg-slate-900/80">
                <h1 className="text-2xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  <svg className="w-8 h-8 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  Virtual Gym Buddy
                </h1>
             </div>
             
             <div className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-hide">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === "user" 
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-none" 
                        : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                     <div className="bg-slate-800 rounded-2xl rounded-bl-none px-5 py-4 border border-slate-700 flex space-x-2 items-center">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                     </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
             </div>

             <div className="p-4 border-t border-white/10 bg-slate-900/80">
               <form onSubmit={sendMessage} className="flex space-x-4">
                 <input 
                   type="text" 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder="Type your message..."
                   className="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                 />
                 <button 
                   type="submit" 
                   disabled={!input.trim() || loading}
                   className="bg-purple-500 hover:bg-purple-400 text-white rounded-xl px-6 font-semibold transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Send
                 </button>
               </form>
             </div>
          </div>

          {/* Habit Tracker Section */}
          <div className="md:col-span-4 flex flex-col space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Behavioral Insights
              </h3>
              
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-1">Detected Sentiment</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  lastSentiment === 'Positive' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  lastSentiment === 'Negative' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {lastSentiment}
                </div>
              </div>

              {skipData && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Skip Probability</p>
                  <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        skipData.skip_probability > 0.5 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                      }`}
                      style={{ width: `${skipData.skip_probability * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-slate-500 font-medium mb-6">
                    {Math.round(skipData.skip_probability * 100)}%
                  </p>

                  {skipData.nudge && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-orange-200 text-sm leading-relaxed relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                      <span className="font-semibold text-orange-400 block mb-1">Coach Nudge:</span>
                      {skipData.nudge}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Decorative Card */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl flex-grow flex items-center justify-center text-center">
               <div>
                 <svg className="w-12 h-12 mx-auto text-pink-400 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                 <p className="text-slate-400 font-light">Consistency is the key to progress. Let's make today count.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
