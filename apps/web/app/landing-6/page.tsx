'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
  opacity: number;
}

export default function Landing6() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ASCII characters to use
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]<>?/|\\~`!+-=_';
    const charArray = chars.split('');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops();
    };

    const initDrops = () => {
      dropsRef.current = [];
      const columnWidth = 20;
      const columns = Math.floor(canvas.width / columnWidth);

      for (let i = 0; i < columns; i++) {
        const dropCount = Math.random() > 0.7 ? 2 : 1;
        for (let j = 0; j < dropCount; j++) {
          dropsRef.current.push({
            x: i * columnWidth + 10,
            y: Math.random() * -canvas.height,
            speed: Math.random() * 2 + 1,
            length: Math.floor(Math.random() * 20) + 10,
            chars: Array(30).fill('').map(() => charArray[Math.floor(Math.random() * charArray.length)] || 'A'),
            opacity: Math.random() * 0.5 + 0.5,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const animate = () => {
      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '16px monospace';
      ctx.textAlign = 'center';

      dropsRef.current.forEach((drop) => {
        // Update position
        drop.y += drop.speed;

        // Reset if off screen
        if (drop.y - drop.length * 20 > canvas.height) {
          drop.y = -drop.length * 20;
          drop.chars = drop.chars.map(() => charArray[Math.floor(Math.random() * charArray.length)] || 'A');
        }

        // Mouse interaction - repel drops
        const dx = drop.x - mouseRef.current.x;
        const dy = drop.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          const force = (100 - distance) / 100;
          drop.x += (dx / distance) * force * 5;
        } else {
          // Slowly return to original column
          const targetX = Math.floor(drop.x / 20) * 20 + 10;
          drop.x += (targetX - drop.x) * 0.02;
        }

        // Draw characters
        drop.chars.forEach((char, index) => {
          const charY = drop.y + index * 20;
          
          if (charY > 0 && charY < canvas.height) {
            // Calculate brightness based on position in drop
            let brightness = 1;
            if (index < 5) {
              brightness = 1; // Head is brightest
            } else if (index < drop.length) {
              brightness = 1 - (index - 5) / (drop.length - 5) * 0.8;
            } else {
              brightness = 0.2;
            }

            // Green with varying brightness
            const green = Math.floor(255 * brightness);
            ctx.fillStyle = `rgba(0, ${green}, 0, ${drop.opacity * brightness})`;
            
            // White head for some drops
            if (index === 0 && Math.random() > 0.95) {
              ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity})`;
            }

            // Randomly change character
            if (Math.random() > 0.98) {
              drop.chars[index] = charArray[Math.floor(Math.random() * charArray.length)] || 'A';
            }

            ctx.fillText(char, drop.x, charY);
          }
        });
      });

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
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="text-center z-10 p-8 backdrop-blur-sm bg-black/30 border border-green-500/20 rounded-lg">
          <h1 className="text-6xl md:text-8xl font-mono font-bold text-green-400 glitch-text relative space-y-2 mb-4">
            <span className="block">DIGITAL</span>
            <span className="block">RAIN</span>
          </h1>
          <p className="text-xl text-green-300/80 font-mono mb-6">
            The matrix has you...
          </p>
          <div className="flex gap-4 justify-center text-sm mb-8">
            <span className="text-green-500 font-mono animate-pulse">
              Follow the white rabbit
            </span>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              asChild
              variant="outline"
              className="font-mono rounded-none border-2 border-green-500/50 bg-black/80 hover:bg-green-950/50 text-green-400 hover:text-green-300 hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] min-h-12 px-6 py-3 text-base"
            >
              <Link href="/landing-5">
                ← Previous
              </Link>
            </Button>
            <Button
              asChild
              className="font-mono rounded-none border-2 border-green-500 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-black font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.8)] min-h-12 px-6 py-3 text-base"
            >
              <Link href="/">
                EXIT MATRIX
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-mono rounded-none border-2 border-green-500/50 bg-black/80 hover:bg-green-950/50 text-green-400 hover:text-green-300 hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] min-h-12 px-6 py-3 text-base"
            >
              <Link href="/landing-1">
                Restart →
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <style>{`
        .glitch-text {
          animation: glitch 2s infinite;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          animation: glitch-1 0.5s infinite;
          color: #00ff00;
          z-index: -1;
          filter: blur(1px);
        }
        
        .glitch-text::after {
          animation: glitch-2 0.5s infinite;
          color: #00ffaa;
          z-index: -2;
          filter: blur(1px);
        }
        
        @keyframes glitch {
          0% {
            text-shadow: 0.05em 0 0 #00fffc, -0.05em -0.025em 0 #fc00ff,
              0.025em 0.05em 0 #fffc00;
          }
          15% {
            text-shadow: 0.05em 0 0 #00fffc, -0.05em -0.025em 0 #fc00ff,
              0.025em 0.05em 0 #fffc00;
          }
          16% {
            text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.025em 0 #fc00ff,
              -0.05em -0.05em 0 #fffc00;
          }
          49% {
            text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.025em 0 #fc00ff,
              -0.05em -0.05em 0 #fffc00;
          }
          50% {
            text-shadow: 0.025em 0.05em 0 #00fffc, 0.05em 0 0 #fc00ff,
              0 -0.05em 0 #fffc00;
          }
          99% {
            text-shadow: 0.025em 0.05em 0 #00fffc, 0.05em 0 0 #fc00ff,
              0 -0.05em 0 #fffc00;
          }
          100% {
            text-shadow: -0.025em 0 0 #00fffc, -0.025em -0.025em 0 #fc00ff,
              -0.025em -0.05em 0 #fffc00;
          }
        }
        
        @keyframes glitch-1 {
          0% {
            clip: rect(132px, 9999px, 114px, 0);
          }
          5% {
            clip: rect(15px, 9999px, 76px, 0);
          }
          10% {
            clip: rect(80px, 9999px, 145px, 0);
          }
          15% {
            clip: rect(42px, 9999px, 92px, 0);
          }
          20% {
            clip: rect(14px, 9999px, 117px, 0);
          }
          25% {
            clip: rect(1px, 9999px, 28px, 0);
          }
          30% {
            clip: rect(100px, 9999px, 8px, 0);
          }
          35% {
            clip: rect(51px, 9999px, 128px, 0);
          }
          40% {
            clip: rect(32px, 9999px, 71px, 0);
          }
          45% {
            clip: rect(61px, 9999px, 27px, 0);
          }
          50% {
            clip: rect(91px, 9999px, 38px, 0);
          }
          55% {
            clip: rect(28px, 9999px, 135px, 0);
          }
          60% {
            clip: rect(67px, 9999px, 53px, 0);
          }
          65% {
            clip: rect(104px, 9999px, 3px, 0);
          }
          70% {
            clip: rect(79px, 9999px, 112px, 0);
          }
          75% {
            clip: rect(8px, 9999px, 144px, 0);
          }
          80% {
            clip: rect(36px, 9999px, 24px, 0);
          }
          85% {
            clip: rect(75px, 9999px, 98px, 0);
          }
          90% {
            clip: rect(110px, 9999px, 61px, 0);
          }
          95% {
            clip: rect(21px, 9999px, 149px, 0);
          }
          100% {
            clip: rect(54px, 9999px, 86px, 0);
          }
        }
        
        @keyframes glitch-2 {
          0% {
            clip: rect(29px, 9999px, 84px, 0);
          }
          5% {
            clip: rect(123px, 9999px, 22px, 0);
          }
          10% {
            clip: rect(61px, 9999px, 130px, 0);
          }
          15% {
            clip: rect(6px, 9999px, 107px, 0);
          }
          20% {
            clip: rect(88px, 9999px, 42px, 0);
          }
          25% {
            clip: rect(148px, 9999px, 118px, 0);
          }
          30% {
            clip: rect(41px, 9999px, 4px, 0);
          }
          35% {
            clip: rect(14px, 9999px, 105px, 0);
          }
          40% {
            clip: rect(121px, 9999px, 60px, 0);
          }
          45% {
            clip: rect(34px, 9999px, 151px, 0);
          }
          50% {
            clip: rect(128px, 9999px, 48px, 0);
          }
          55% {
            clip: rect(63px, 9999px, 92px, 0);
          }
          60% {
            clip: rect(15px, 9999px, 137px, 0);
          }
          65% {
            clip: rect(87px, 9999px, 70px, 0);
          }
          70% {
            clip: rect(119px, 9999px, 11px, 0);
          }
          75% {
            clip: rect(45px, 9999px, 80px, 0);
          }
          80% {
            clip: rect(72px, 9999px, 127px, 0);
          }
          85% {
            clip: rect(2px, 9999px, 98px, 0);
          }
          90% {
            clip: rect(135px, 9999px, 31px, 0);
          }
          95% {
            clip: rect(18px, 9999px, 43px, 0);
          }
          100% {
            clip: rect(93px, 9999px, 7px, 0);
          }
        }
      `}</style>
    </div>
  );
}