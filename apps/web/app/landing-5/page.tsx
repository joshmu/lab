"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Home, Sparkles, Circle } from "lucide-react";

interface Shape {
  x: number;
  y: number;
  radius: number;
  sides: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  scaleSpeed: number;
  hue: number;
  hueSpeed: number;
  life: number;
  maxLife: number;
}

export default function Landing5() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const shapesRef = useRef<Shape[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createShape = (x: number, y: number): Shape => {
      return {
        x,
        y,
        radius: Math.random() * 50 + 20,
        sides: Math.floor(Math.random() * 4) + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scale: 0,
        scaleSpeed: Math.random() * 0.02 + 0.01,
        hue: Math.random() * 360,
        hueSpeed: Math.random() * 2 - 1,
        life: 0,
        maxLife: Math.random() * 200 + 100,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Create shapes on mouse movement
      if (Math.random() > 0.7) {
        shapesRef.current.push(
          createShape(mouseRef.current.x, mouseRef.current.y),
        );
      }
    };

    const drawShape = (shape: Shape, alpha: number) => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      ctx.scale(shape.scale, shape.scale);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shape.radius);
      gradient.addColorStop(0, `hsla(${shape.hue}, 70%, 60%, ${alpha})`);
      gradient.addColorStop(
        0.5,
        `hsla(${shape.hue + 30}, 70%, 50%, ${alpha * 0.5})`,
      );
      gradient.addColorStop(1, `hsla(${shape.hue + 60}, 70%, 40%, 0)`);

      ctx.fillStyle = gradient;
      ctx.strokeStyle = `hsla(${shape.hue}, 80%, 70%, ${alpha * 0.3})`;
      ctx.lineWidth = 2;

      ctx.beginPath();

      if (shape.sides === 3) {
        // Triangle
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * shape.radius;
          const y = Math.sin(angle) * shape.radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (shape.sides === 4) {
        // Square with rounded corners
        const size = shape.radius;
        const cornerRadius = size * 0.2;
        ctx.roundRect(-size, -size, size * 2, size * 2, cornerRadius);
      } else if (shape.sides === 5) {
        // Pentagon
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * shape.radius;
          const y = Math.sin(angle) * shape.radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Circle
        ctx.arc(0, 0, shape.radius, 0, Math.PI * 2);
      }

      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner details
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, shape.radius * (0.3 + i * 0.2), 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${shape.hue + i * 20}, 80%, 70%, ${alpha * 0.1})`;
        ctx.stroke();
      }

      ctx.restore();
    };

    const animate = () => {
      timeRef.current += 0.01;

      // Fade effect
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Auto-generate shapes
      if (Math.random() > 0.98) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        shapesRef.current.push(createShape(x, y));
      }

      // Update and draw shapes
      shapesRef.current = shapesRef.current.filter((shape) => {
        shape.life++;

        // Update properties
        shape.rotation += shape.rotationSpeed;
        shape.hue += shape.hueSpeed;

        // Growth phase
        if (shape.life < shape.maxLife * 0.3) {
          shape.scale += shape.scaleSpeed;
          if (shape.scale > 1) shape.scale = 1;
        }
        // Shrink phase
        else if (shape.life > shape.maxLife * 0.7) {
          shape.scale -= shape.scaleSpeed;
          if (shape.scale < 0) shape.scale = 0;
        }

        // Organic movement
        shape.x += Math.sin(timeRef.current + shape.rotation) * 0.5;
        shape.y += Math.cos(timeRef.current + shape.rotation) * 0.5;

        // Mouse interaction
        const dx = shape.x - mouseRef.current.x;
        const dy = shape.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          const force = (150 - distance) / 150;
          shape.x += (dx / distance) * force * 2;
          shape.y += (dy / distance) * force * 2;
          shape.rotationSpeed += force * 0.01;
        }

        // Calculate alpha based on life
        let alpha = 1;
        if (shape.life < 20) {
          alpha = shape.life / 20;
        } else if (shape.life > shape.maxLife - 20) {
          alpha = (shape.maxLife - shape.life) / 20;
        }

        drawShape(shape, alpha);

        return shape.life < shape.maxLife;
      });

      // Draw connections between nearby shapes
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;

      for (let i = 0; i < shapesRef.current.length; i++) {
        for (let j = i + 1; j < shapesRef.current.length; j++) {
          const shape1 = shapesRef.current[i];
          const shape2 = shapesRef.current[j];
          if (!shape1 || !shape2) continue;

          const dx = shape2.x - shape1.x;
          const dy = shape2.y - shape1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(shape1.x, shape1.y);
            ctx.lineTo(shape2.x, shape2.y);
            ctx.stroke();
          }
        }
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center z-10 p-8 max-w-4xl">
          <h1 className="space-y-2 mb-4">
            <span className="block text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 animate-float">
              Organic
            </span>
            <span className="block text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 animate-float [animation-delay:500ms]">
              Evolution
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide mb-6">
            Patterns emerge from chaos, beauty from complexity
          </p>
          <div className="flex gap-6 justify-center mb-8">
            <Badge
              variant="outline"
              className="border-2 border-orange-500/50 bg-orange-500/10 text-orange-300 px-4 py-2"
            >
              <Circle className="mr-2 h-3 w-3 fill-current animate-pulse" />
              Move to create
            </Badge>
            <Badge
              variant="outline"
              className="border-2 border-purple-500/50 bg-purple-500/10 text-purple-300 px-4 py-2"
            >
              <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
              Watch them grow
            </Badge>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              asChild
              variant="ghost"
              className="group relative overflow-hidden rounded-full border-2 border-orange-400/30 hover:border-orange-400 text-orange-100 hover:text-white transition-all duration-500 min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/landing-4">
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/50 to-orange-600/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                <ArrowLeft className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">Previous</span>
              </Link>
            </Button>
            <Button
              asChild
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-900 to-pink-900 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] hover:scale-105 min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Home className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">Home</span>
              </Link>
            </Button>
            <Button
              asChild
              className="group relative overflow-hidden rounded-full bg-white text-black font-bold hover:text-white transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] min-h-11 px-6 py-2.5 text-base"
            >
              <Link href="/landing-6">
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative z-10">Next</span>
                <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
