'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Github, Globe, Sparkles, Zap, Cpu, Binary, Droplets, Grid3x3 } from "lucide-react";

const landingPages = [
  {
    id: 1,
    href: "/landing-1",
    title: "Particle System",
    description: "Interactive particle field with mouse attraction",
    icon: <Sparkles className="w-6 h-6" />,
    color: "bg-purple-500",
    borderColor: "border-purple-600",
    hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-950/20",
    shadowColor: "hover:shadow-[8px_8px_0px_0px_rgb(147,51,234)]",
    tag: "Physics"
  },
  {
    id: 2,
    href: "/landing-2",
    title: "Liquid Morphing",
    description: "Fluid blob animations with metaball effects",
    icon: <Droplets className="w-6 h-6" />,
    color: "bg-pink-500",
    borderColor: "border-pink-600",
    hoverBg: "hover:bg-pink-50 dark:hover:bg-pink-950/20",
    shadowColor: "hover:shadow-[8px_8px_0px_0px_rgb(236,72,153)]",
    tag: "Organic"
  },
  {
    id: 3,
    href: "/landing-3",
    title: "Cyber Grid",
    description: "3D perspective grid with cyberpunk aesthetics",
    icon: <Grid3x3 className="w-6 h-6" />,
    color: "bg-cyan-500",
    borderColor: "border-cyan-600",
    hoverBg: "hover:bg-cyan-50 dark:hover:bg-cyan-950/20",
    shadowColor: "hover:shadow-[8px_8px_0px_0px_rgb(6,182,212)]",
    tag: "3D"
  },
  {
    id: 4,
    href: "/landing-4",
    title: "Glitch Art",
    description: "Digital interference and RGB split effects",
    icon: <Zap className="w-6 h-6" />,
    color: "bg-red-500",
    borderColor: "border-red-600",
    hoverBg: "hover:bg-red-50 dark:hover:bg-red-950/20",
    shadowColor: "hover:shadow-[8px_8px_0px_0px_rgb(239,68,68)]",
    tag: "Chaos"
  },
  {
    id: 5,
    href: "/landing-5",
    title: "Organic Evolution",
    description: "Generative patterns with geometric shapes",
    icon: <Cpu className="w-6 h-6" />,
    color: "bg-orange-500",
    borderColor: "border-orange-600",
    hoverBg: "hover:bg-orange-50 dark:hover:bg-orange-950/20",
    shadowColor: "hover:shadow-[8px_8px_0px_0px_rgb(249,115,22)]",
    tag: "Generative"
  },
  {
    id: 6,
    href: "/landing-6",
    title: "Digital Rain",
    description: "Matrix-style falling ASCII characters",
    icon: <Binary className="w-6 h-6" />,
    color: "bg-green-500",
    borderColor: "border-green-600",
    hoverBg: "hover:bg-green-50 dark:hover:bg-green-950/20",
    shadowColor: "hover:shadow-[8px_8px_0px_0px_rgb(34,197,94)]",
    tag: "Matrix"
  }
];

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-yellow-300 selection:text-black dark:selection:bg-yellow-400">
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-6 py-12 md:py-20 max-w-7xl">
          <div className="space-y-6 mb-16">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase">
                Josh Mu&apos;s Lab
                <span className="inline-block ml-2 text-yellow-400 animate-pulse">🧪</span>
              </h1>
              <div className="h-2 bg-black dark:bg-white max-w-fit"></div>
            </div>
            
            <p className="text-xl md:text-2xl font-mono text-gray-600 dark:text-gray-400 max-w-2xl mt-6">
              A place for experiments
            </p>
            
            <div className="flex items-center gap-3 text-sm font-mono mt-6">
              <Badge variant="secondary" className="rounded-none border-2 border-black dark:border-white px-3 py-1">
                v0.1.0
              </Badge>
              <Badge variant="outline" className="rounded-none border-2 border-black dark:border-white px-3 py-1">
                EXPERIMENTAL
              </Badge>
              <Badge className="rounded-none bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300 px-3 py-1">
                LIVE
              </Badge>
            </div>
          </div>

          {/* Experimental Landing Pages Grid */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-tight">
              Mouse-Reactive Backgrounds
            </h2>
          
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-equal-height"
            onMouseMove={handleMouseMove}
          >
            {landingPages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                onMouseEnter={() => setHoveredCard(page.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative h-full"
              >
                <Card 
                  className={`
                    relative overflow-hidden border-4 border-black dark:border-white rounded-none 
                    transition-all duration-200 ease-out cursor-pointer h-full
                    ${hoveredCard === page.id ? page.shadowColor : ''}
                    ${page.hoverBg}
                    hover:-translate-y-1 hover:translate-x-1
                  `}
                >
                  <div className="p-6 space-y-4 h-full flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 inline-block ${page.color} text-white rounded-none`}>
                        {page.icon}
                      </div>
                      <Badge 
                        variant="outline" 
                        className="rounded-none border-2 border-black dark:border-white font-mono text-xs"
                      >
                        {page.tag}
                      </Badge>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-2xl font-black mb-2 group-hover:underline underline-offset-4">
                        {page.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {page.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-sm font-bold uppercase tracking-wide">
                      <span>Explore</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  {hoveredCard === page.id && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-10"
                      style={{
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, currentColor 0%, transparent 50%)`
                      }}
                    />
                  )}
                </Card>
              </Link>
            ))}
          </div>
          </section>

          {/* CTA Section */}
          <section className="flex flex-wrap gap-6 justify-center items-center">
          <Button
            asChild
            className="inline-flex items-center justify-center gap-2 rounded-none border-4 border-black bg-white text-black hover:bg-yellow-400 hover:text-black font-bold uppercase tracking-wide transition-all duration-200 hover:shadow-[6px_6px_0px_0px_rgb(0,0,0)] dark:border-white dark:bg-black dark:text-white dark:hover:bg-yellow-400 dark:hover:text-black dark:hover:shadow-[6px_6px_0px_0px_rgb(255,255,255)] h-auto px-6 py-3 text-base"
          >
            <a href="https://github.com/joshmu" target="_blank" rel="noopener noreferrer">
              <Github className="mr-3 w-6 h-6" />
              GitHub
            </a>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="inline-flex items-center justify-center gap-2 rounded-none border-4 border-black bg-transparent text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide transition-all duration-200 hover:shadow-[6px_6px_0px_0px_rgb(0,0,0)] dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black dark:hover:shadow-[6px_6px_0px_0px_rgb(255,255,255)] h-auto px-6 py-3 text-base"
          >
            <a href="https://joshmu.dev" target="_blank" rel="noopener noreferrer">
              <Globe className="mr-3 w-6 h-6" />
              joshmu.dev
            </a>
          </Button>
        </section>
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-black dark:border-white py-12">
          <div className="container mx-auto px-6 max-w-7xl flex justify-center items-center gap-6 text-sm font-mono">
            <a
              href="https://github.com/joshmu/lab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline underline-offset-4"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Code icon"
                width={16}
                height={16}
                className="dark:invert"
              />
              View Source
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="https://joshmu.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline underline-offset-4"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
                className="dark:invert"
              />
              joshmu.dev
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}