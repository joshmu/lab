'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Home, Zap } from 'lucide-react';

interface GridPoint {
  x: number;
  y: number;
  z: number;
  originalZ: number;
}

export default function Landing3() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const gridRef = useRef<GridPoint[][]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid();
    };

    const initGrid = () => {
      gridRef.current = [];
      const gridSize = 30;
      const spacing = 40;
      const startX = -((gridSize - 1) * spacing) / 2;
      const startY = -((gridSize - 1) * spacing) / 2;

      for (let i = 0; i < gridSize; i++) {
        gridRef.current[i] = [];
        for (let j = 0; j < gridSize; j++) {
          gridRef.current[i]![j] = {
            x: startX + j * spacing,
            y: startY + i * spacing,
            z: 0,
            originalZ: 0,
          };
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left - canvas.width / 2) / (canvas.width / 2),
        y: (e.clientY - rect.top - canvas.height / 2) / (canvas.height / 2),
      };
    };

    const project3D = (point: GridPoint, centerX: number, centerY: number, perspective: number) => {
      const scale = perspective / (perspective + point.z);
      return {
        x: centerX + point.x * scale,
        y: centerY + point.y * scale,
        scale,
      };
    };

    const animate = () => {
      timeRef.current += 0.01;
      
      ctx.fillStyle = 'rgba(10, 10, 15, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const perspective = 800;

      // Update grid based on mouse position
      gridRef.current.forEach((row, i) => {
        row.forEach((point, j) => {
          // Wave effect
          const waveX = Math.sin(timeRef.current + i * 0.1) * 20;
          const waveY = Math.cos(timeRef.current + j * 0.1) * 20;
          
          // Mouse influence
          const distFromCenter = Math.sqrt(
            Math.pow((i - gridRef.current.length / 2) / gridRef.current.length, 2) +
            Math.pow((j - row.length / 2) / row.length, 2)
          );
          
          const mouseInfluence = 100 * (1 - distFromCenter);
          point.z = point.originalZ + waveX + waveY + 
                   mouseRef.current.x * mouseInfluence * 0.5 +
                   mouseRef.current.y * mouseInfluence * 0.5;
        });
      });

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      // Horizontal lines
      gridRef.current.forEach((row) => {
        ctx.beginPath();
        row.forEach((point, index) => {
          const projected = project3D(point, centerX, centerY, perspective);
          if (index === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        });
        ctx.stroke();
      });

      // Vertical lines
      for (let j = 0; j < gridRef.current[0]!.length; j++) {
        ctx.beginPath();
        gridRef.current.forEach((row, index) => {
          const projected = project3D(row[j]!, centerX, centerY, perspective);
          if (index === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        });
        ctx.stroke();
      }

      // Draw glowing nodes at intersections
      gridRef.current.forEach((row, i) => {
        row.forEach((point, j) => {
          if (i % 3 === 0 && j % 3 === 0) {
            const projected = project3D(point, centerX, centerY, perspective);
            
            // Outer glow
            const gradient = ctx.createRadialGradient(
              projected.x, projected.y, 0,
              projected.x, projected.y, 10 * projected.scale
            );
            gradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
              projected.x - 20 * projected.scale,
              projected.y - 20 * projected.scale,
              40 * projected.scale,
              40 * projected.scale
            );
            
            // Inner node
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(
              projected.x - 2 * projected.scale,
              projected.y - 2 * projected.scale,
              4 * projected.scale,
              4 * projected.scale
            );
          }
        });
      });

      // Add scan line effect
      const scanLineY = (timeRef.current * 100) % canvas.height;
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.fillRect(0, scanLineY, canvas.width, 2);
      
      // Add glow at scan line position
      const scanGradient = ctx.createLinearGradient(0, scanLineY - 20, 0, scanLineY + 20);
      scanGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
      scanGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
      scanGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanLineY - 20, canvas.width, 40);

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    
    animate();
    setIsLoaded(true);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="text-center z-10 p-8 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-cyan-400 glitch relative mb-4" data-text="CYBER GRID">
            CYBER GRID
          </h1>
          <p className="text-xl md:text-2xl text-cyan-300 font-mono mb-6">
            <span className="typewriter">Navigate the digital frontier_</span>
          </p>
          <div className="flex gap-8 justify-center font-mono mb-8">
            <div className="text-center">
              <Badge variant="outline" className="border-2 border-cyan-500/50 bg-cyan-500/10 text-cyan-300 px-4 py-2">
                <Zap className="mr-2 h-4 w-4 animate-pulse" />
                <span className="text-xs opacity-70">SYSTEM</span>
                <span className="ml-2 font-bold">ONLINE</span>
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="border-2 border-pink-500/50 bg-pink-500/10 text-pink-300 px-4 py-2">
                <span className="text-xs opacity-70">MATRIX</span>
                <span className="ml-2 font-bold">ACTIVE</span>
              </Badge>
            </div>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              asChild
              variant="outline"
              className="rounded-none border-2 border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/50 hover:bg-cyan-900/50 backdrop-blur-sm text-cyan-100 hover:text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] skew-x-[-10deg] hover:skew-x-0 min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/landing-2">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-2 border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-none bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] skew-x-[10deg] hover:skew-x-0 min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/landing-4">
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <style>{`
        .glitch {
          position: relative;
          animation: glitch 2s infinite;
        }
        
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch::before {
          animation: glitch-1 0.5s infinite;
          color: #00ffff;
          z-index: -1;
        }
        
        .glitch::after {
          animation: glitch-2 0.5s infinite;
          color: #ff00ff;
          z-index: -2;
        }
        
        @keyframes glitch {
          0%, 100% { text-shadow: 0 0 10px rgba(0, 255, 255, 0.8); }
          20% { text-shadow: 3px 0 10px rgba(255, 0, 255, 0.8); }
          40% { text-shadow: -3px 0 10px rgba(0, 255, 255, 0.8); }
          60% { text-shadow: 0 0 10px rgba(255, 0, 255, 0.8); }
          80% { text-shadow: 3px 0 10px rgba(0, 255, 255, 0.8); }
        }
        
        @keyframes glitch-1 {
          0%, 100% { clip: rect(0, 9999px, 9999px, 0); transform: translate(0); }
          20% { clip: rect(20px, 9999px, 60px, 0); transform: translate(-2px, 2px); }
          40% { clip: rect(65px, 9999px, 120px, 0); transform: translate(2px, -2px); }
          60% { clip: rect(0, 9999px, 40px, 0); transform: translate(1px, 0); }
          80% { clip: rect(80px, 9999px, 9999px, 0); transform: translate(-1px, 1px); }
        }
        
        @keyframes glitch-2 {
          0%, 100% { clip: rect(0, 9999px, 9999px, 0); transform: translate(0); }
          20% { clip: rect(65px, 9999px, 120px, 0); transform: translate(2px, -1px); }
          40% { clip: rect(0, 9999px, 40px, 0); transform: translate(-2px, 1px); }
          60% { clip: rect(20px, 9999px, 60px, 0); transform: translate(-1px, -1px); }
          80% { clip: rect(80px, 9999px, 9999px, 0); transform: translate(1px, 2px); }
        }
        
        .typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid currentColor;
          animation: typing 2s steps(40, end), blink 0.75s step-end infinite;
        }
        
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes blink {
          from, to { border-color: transparent; }
          50% { border-color: currentColor; }
        }
      `}</style>
    </div>
  );
}