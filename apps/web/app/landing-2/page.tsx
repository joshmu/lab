'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Home, Activity } from 'lucide-react';

interface Blob {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  angle: number;
  speed: number;
  hue: number;
}

export default function Landing2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const blobsRef = useRef<Blob[]>([]);
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
      initBlobs();
    };

    const initBlobs = () => {
      blobsRef.current = [];
      const blobCount = 8;
      
      for (let i = 0; i < blobCount; i++) {
        blobsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          radius: Math.random() * 100 + 50,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.5 + 0.5,
          hue: Math.random() * 360,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const metaball = (x: number, y: number) => {
      let sum = 0;
      blobsRef.current.forEach((blob) => {
        const dx = x - blob.x;
        const dy = y - blob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        sum += (blob.radius * blob.radius) / (distance * distance);
      });
      
      // Add mouse influence
      const mouseDx = x - mouseRef.current.x;
      const mouseDy = y - mouseRef.current.y;
      const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
      sum += 10000 / (mouseDistance * mouseDistance);
      
      return sum;
    };

    const animate = () => {
      timeRef.current += 0.01;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(20, 20, 20, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update blobs
      blobsRef.current.forEach((blob, index) => {
        // Move towards target
        const dx = blob.targetX - blob.x;
        const dy = blob.targetY - blob.y;
        blob.x += dx * 0.02;
        blob.y += dy * 0.02;
        
        // If close to target, pick new target
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          blob.targetX = Math.random() * canvas.width;
          blob.targetY = Math.random() * canvas.height;
        }
        
        // Organic movement
        blob.x += Math.sin(timeRef.current + index) * 2;
        blob.y += Math.cos(timeRef.current + index * 0.8) * 2;
        
        // Mouse repulsion
        const mouseDx = blob.x - mouseRef.current.x;
        const mouseDy = blob.y - mouseRef.current.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        if (mouseDistance < 200) {
          const force = (200 - mouseDistance) / 200;
          blob.x += (mouseDx / mouseDistance) * force * 10;
          blob.y += (mouseDy / mouseDistance) * force * 10;
        }
      });

      // Render metaballs
      const step = 4; // Sampling step for performance
      
      for (let x = 0; x < canvas.width; x += step) {
        for (let y = 0; y < canvas.height; y += step) {
          const value = metaball(x, y);
          
          if (value > 1) {
            // Calculate color based on position and time
            const hue = (x / canvas.width * 60 + y / canvas.height * 60 + timeRef.current * 20) % 360;
            const color = `hsl(${hue}, 70%, ${50 + value * 10}%)`;
            
            // Convert HSL to RGB
            ctx.fillStyle = color;
            ctx.fillRect(x, y, step, step);
          }
        }
      }

      // Add glow effect
      ctx.filter = 'blur(20px)';
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';

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
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-2000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="text-center z-10 p-8 max-w-4xl">
          <h1 className="relative space-y-2 mb-4">
            <span className="block text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-bounce">
              Liquid
            </span>
            <span className="block text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-bounce [animation-delay:500ms]">
              Dreams
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide mb-6">
            Morphing realities in perpetual motion
          </p>
          <Badge 
            variant="outline" 
            className="border-2 border-purple-500/50 bg-purple-500/10 text-purple-300 px-4 py-2 text-sm font-medium mb-8"
          >
            <Activity className="mr-2 h-4 w-4 animate-pulse" />
            Interactive
          </Badge>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white/90 hover:text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/landing-1">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white/90 hover:text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-105 min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/landing-3">
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}