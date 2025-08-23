"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  AlertTriangle,
  Terminal,
} from "lucide-react";

export default function Landing4() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const timeRef = useRef(0);
  const glitchIntensityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Increase glitch intensity based on mouse movement speed
      glitchIntensityRef.current = Math.min(
        glitchIntensityRef.current + 2,
        100,
      );
    };

    const drawText = (text: string, x: number, y: number, size: number) => {
      ctx.font = `bold ${size}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Main text with RGB split
      const offset = glitchIntensityRef.current / 10;

      // Red channel
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "rgb(255, 0, 0)";
      ctx.fillText(text, x - offset, y);

      // Green channel
      ctx.fillStyle = "rgb(0, 255, 0)";
      ctx.fillText(text, x, y);

      // Blue channel
      ctx.fillStyle = "rgb(0, 0, 255)";
      ctx.fillText(text, x + offset, y);

      ctx.globalCompositeOperation = "source-over";
    };

    const drawGlitchBars = () => {
      const barCount = Math.floor(
        Math.random() * 5 + glitchIntensityRef.current / 20,
      );

      for (let i = 0; i < barCount; i++) {
        const y = Math.random() * canvas.height;
        const height = Math.random() * 50 + 5;
        const offset =
          (Math.random() - 0.5) * 50 * (glitchIntensityRef.current / 100);

        // Create glitch bar with noise
        const imageData = ctx.getImageData(0, y, canvas.width, height);
        const data = imageData.data;

        // Shift RGB channels
        for (let j = 0; j < data.length; j += 4) {
          if (Math.random() > 0.5) {
            data[j] = data[j + 4] || 0; // Red
            data[j + 1] = data[j - 4] || 0; // Green
            data[j + 2] = data[j + 8] || 0; // Blue
          }
        }

        ctx.putImageData(imageData, offset, y);
      }
    };

    const drawNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      const noiseIntensity = glitchIntensityRef.current / 100;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255 * noiseIntensity;
        data[i] = noise; // Red
        data[i + 1] = noise; // Green
        data[i + 2] = noise; // Blue
        data[i + 3] = noise * 0.1; // Alpha
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const drawScanlines = () => {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1;

      for (let y = 0; y < canvas.height; y += 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      timeRef.current += 0.02;

      // Decay glitch intensity
      glitchIntensityRef.current *= 0.95;

      // Clear canvas
      ctx.fillStyle = "rgb(10, 10, 10)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background pattern
      const patternSize = 50;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += patternSize) {
        for (let y = 0; y < canvas.height; y += patternSize) {
          if (Math.random() > 0.8) {
            ctx.strokeRect(x, y, patternSize, patternSize);
          }
        }
      }

      // Draw noise
      drawNoise();

      // Draw main text
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Glitch displacement
      const displaceX =
        ((Math.random() - 0.5) * glitchIntensityRef.current) / 5;
      const displaceY =
        ((Math.random() - 0.5) * glitchIntensityRef.current) / 5;

      drawText("DIGITAL", centerX + displaceX, centerY - 80 + displaceY, 100);
      drawText("CHAOS", centerX - displaceX, centerY + 20 - displaceY, 100);

      // Draw glitch bars
      if (Math.random() > 0.7 || glitchIntensityRef.current > 20) {
        drawGlitchBars();
      }

      // Draw scan lines
      drawScanlines();

      // Mouse interaction visual
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        200,
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Random glitch spikes
      if (Math.random() > 0.98) {
        glitchIntensityRef.current = 100;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    animate();
    setIsLoaded(true);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center z-10 p-8 max-w-4xl glitch-container">
          <div className="flex justify-center mb-4">
            <Badge
              variant="destructive"
              className="px-6 py-3 text-lg font-mono animate-pulse border-2 border-red-500 bg-red-500/20"
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              SYSTEM UNSTABLE
            </Badge>
          </div>
          <p className="text-xl md:text-2xl text-red-400 font-mono glitch-text mb-6">
            Reality.exe has stopped responding
          </p>
          <div className="bg-black/80 border border-red-500/30 rounded-none p-4 font-mono text-green-400 text-left inline-block mb-8">
            <div className="flex items-center">
              <Terminal className="mr-2 h-4 w-4" />
              <span className="opacity-70">$</span>
              <span className="ml-2">sudo fix --reality --force</span>
              <span className="ml-1 animate-pulse">_</span>
            </div>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              asChild
              variant="outline"
              className="rounded-none border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white hover:text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] glitch-button min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/landing-3">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-2 border-green-500/50 hover:border-green-400 bg-green-950/30 hover:bg-green-900/30 backdrop-blur-sm text-green-100 hover:text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-none bg-red-500 hover:bg-white text-white hover:text-black font-bold border-2 border-red-500 hover:border-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] glitch-button min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/landing-5">
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <style>{`
        .glitch-container {
          animation: glitch-skew 3s infinite;
        }
        
        .glitch-text {
          animation: glitch-text 2s infinite;
        }
        
        .glitch-button:hover {
          animation: glitch-button 0.3s infinite;
        }
        
        @keyframes glitch-skew {
          0%, 100% { transform: skew(0deg); }
          20% { transform: skew(1deg); }
          40% { transform: skew(-1deg); }
          60% { transform: skew(0.5deg); }
          80% { transform: skew(-0.5deg); }
        }
        
        @keyframes glitch-text {
          0%, 100% { 
            text-shadow: 
              2px 0 #ff0000,
              -2px 0 #00ff00,
              0 0 10px rgba(255, 0, 0, 0.5);
          }
          20% { 
            text-shadow: 
              -2px 0 #ff0000,
              2px 0 #00ff00,
              0 0 10px rgba(0, 255, 0, 0.5);
          }
          40% { 
            text-shadow: 
              2px 2px #ff0000,
              -2px -2px #00ff00,
              0 0 15px rgba(255, 255, 0, 0.5);
          }
        }
        
        @keyframes glitch-button {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  );
}
