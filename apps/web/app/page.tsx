'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Github, Globe } from "lucide-react";
import { NavigationTree } from "./components/navigation/NavigationTree";
import { SearchBar } from "./components/navigation/SearchBar";
import { FilterPanel } from "./components/navigation/FilterPanel";
import { BrutalistWrapper } from "./lib/brutalist-wrapper";
import { BRUTALIST_THEME, brutalistClasses } from "./lib/brutalist-theme";
import type { NavigationNode, FilterOptions, ExperimentMetadata } from "../lib/experiment-processing/types";
import { cn } from "@/lib/utils";

// Route mapping for experiments to landing pages
const experimentRouteMap: Record<string, string> = {
  'particle-system': '/landing-1',
  'liquid-morphing': '/landing-2',
  'cyber-grid': '/landing-3',
  'glitch-art': '/landing-4',
  'organic-evolution': '/landing-5',
  'digital-rain': '/landing-6'
};

export default function Home() {
  const [navigationData, setNavigationData] = useState<{ nodes: NavigationNode[]; searchIndex: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/experiments')
      .then(res => res.json())
      .then(data => {
        setNavigationData({
          nodes: data.navigationTree?.nodes || [],
          searchIndex: data.searchIndex || null
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load experiments:', err);
        setLoading(false);
      });
  }, []);


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

          {/* Experiment Explorer Section */}
          <section className="mb-16">
            <h2 className={cn(
              "text-3xl md:text-4xl mb-8",
              BRUTALIST_THEME.typography.heading
            )}>
              EXPERIMENT EXPLORER
            </h2>
          
          {
            loading ? (
              <div className={cn(
                "flex items-center justify-center h-64",
                brutalistClasses.border,
                brutalistClasses.shadow,
                brutalistClasses.bgWhite
              )}>
                <p className={cn(brutalistClasses.mono, "animate-pulse")}>LOADING EXPERIMENTS...</p>
              </div>
            ) : navigationData ? (
              <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                  <BrutalistWrapper variant="card" shadow="sm" noPadding>
                    <SearchBar
                      onSearch={setSearchQuery}
                      placeholder="SEARCH EXPERIMENTS"
                      className="w-full"
                    />
                  </BrutalistWrapper>
                  
                  <BrutalistWrapper variant="panel" shadow="md">
                    <FilterPanel
                      options={filters}
                      availableCategories={['animations', 'data-visualization', 'interactions', 'effects', 'prototypes', 'algorithms']}
                      availableTags={[]}
                      availableTechStack={[]}
                      onChange={setFilters}
                      onReset={() => setFilters({})}
                    />
                  </BrutalistWrapper>
                  
                  <BrutalistWrapper variant="panel" shadow="lg" className="flex-grow min-h-[400px] md:min-h-[500px] lg:min-h-[600px] overflow-auto">
                    <NavigationTree
                      nodes={navigationData.nodes}
                      searchQuery={searchQuery}
                      experimentRouteMap={experimentRouteMap}
                      className="h-full"
                    />
                  </BrutalistWrapper>
              </div>
            ) : (
              <div className={cn(
                "text-center py-8",
                brutalistClasses.mono
              )}>
                Failed to load experiments
              </div>
            )
          }
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