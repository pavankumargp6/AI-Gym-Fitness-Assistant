"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function TrainerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedback, setFeedback] = useState("Waiting for feed...");
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        connectWebSocket();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setFeedback("Failed to access camera.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    if (wsRef.current) wsRef.current.close();
  };

  const connectWebSocket = () => {
    wsRef.current = new WebSocket("ws://localhost:8000/ws/trainer");

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      setFeedback("Connected. Start exercising!");
      requestAnimationFrame(sendFrame);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        console.error(data.error);
        return;
      }
      setCounter(data.counter);
      setFeedback(data.feedback);
      drawLandmarks(data.landmarks);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };
  };

  const sendFrame = () => {
    if (!isStreaming || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    if (videoRef.current && canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.5); // compress
        wsRef.current.send(dataUrl);
      }
    }

    // Throttle frames to ~10fps to save bandwidth and compute
    setTimeout(() => {
      if (isStreaming) requestAnimationFrame(sendFrame);
    }, 100);
  };

  const drawLandmarks = (landmarks: any[]) => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const width = canvasRef.current.width = videoRef.current.clientWidth;
    const height = canvasRef.current.height = videoRef.current.clientHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#22d3ee"; // cyan-400

    if (landmarks && landmarks.length > 0) {
      landmarks.forEach((lm) => {
        if (lm.visibility > 0.5) {
          const x = lm.x * width;
          const y = lm.y * height;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10">
        <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-8 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">
            AI Gym Trainer
          </h1>
          <p className="text-slate-400 text-lg">Real-time posture analysis and form correction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Video Feed */}
          <div className="md:col-span-8 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 min-h-[400px] flex items-center justify-center">
            {!isStreaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <button 
                  onClick={startCamera}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/25 transition-all"
                >
                  Start Camera
                </button>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-auto object-cover transform -scale-x-100" 
            />
            {/* Canvas overlay for drawing landmarks */}
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full pointer-events-none transform -scale-x-100"
            />
          </div>

          {/* Sidebar Stats */}
          <div className="md:col-span-4 flex flex-col space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl flex-grow">
              <h3 className="text-xl font-medium text-slate-400 mb-2">Reps Count</h3>
              <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-cyan-600 mb-8">
                {counter}
              </div>
              
              <h3 className="text-xl font-medium text-slate-400 mb-2">Live Feedback</h3>
              <div className="text-2xl font-semibold text-fuchsia-400 break-words">
                {feedback}
              </div>
            </div>

            {isStreaming && (
              <button 
                onClick={stopCamera}
                className="w-full bg-slate-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 text-slate-300 font-medium py-4 px-6 rounded-2xl border border-slate-700 transition-all duration-300"
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
