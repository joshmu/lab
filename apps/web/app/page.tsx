'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Globe } from "lucide-react";
import { NavigationTree } from "./components/navigation/NavigationTree";
import { SearchBar } from "./components/navigation/SearchBar";
import { FilterPanel } from "./components/navigation/FilterPanel";
import type { NavigationNode, FilterOptions } from "../lib/experiment-processing/types";
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 max-w-7xl">
          <div className="space-y-6 mb-12 md:mb-16">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
                Josh Mu's Lab
                <span className="inline-block ml-2 animate-pulse">🧪</span>
              </h1>
              <div className="h-1 bg-primary max-w-fit w-24 sm:w-32"></div>
            </div>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mt-6">
              A place for experiments
            </p>
            
            <div className="flex flex-wrap items-center gap-2 text-sm mt-6">
              <Badge variant="secondary">
                v0.1.0
              </Badge>
              <Badge variant="outline">
                Experimental
              </Badge>
              <Badge variant="default">
                Live
              </Badge>
            </div>
          </div>

          {/* Experiment Explorer Section */}
          <section className="mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8">
              Experiment Explorer
            </h2>
          
          {
            loading ? (
              <Card className="h-64 flex items-center justify-center">
                <CardContent>
                  <p className="text-muted-foreground animate-pulse">Loading experiments...</p>
                </CardContent>
              </Card>
            ) : navigationData ? (
              <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto w-full">
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="Search experiments..."
                  className="w-full"
                />
                
                <FilterPanel
                  options={filters}
                  availableCategories={['animations', 'data-visualization', 'interactions', 'effects', 'prototypes', 'algorithms']}
                  availableTags={[]}
                  availableTechStack={[]}
                  onChange={setFilters}
                  onReset={() => setFilters({})}
                />
                
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] overflow-auto">
                    <NavigationTree
                      nodes={navigationData.nodes}
                      searchQuery={searchQuery}
                      experimentRouteMap={experimentRouteMap}
                      className="h-full"
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load experiments</p>
              </div>
            )
          }
          </section>

          {/* CTA Section */}
          <section className="flex flex-wrap gap-4 justify-center items-center">
            <Button asChild size="lg">
              <a href="https://github.com/joshmu" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </a>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <a href="https://joshmu.dev" target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-5 w-5" />
                joshmu.dev
              </a>
            </Button>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t py-8 sm:py-12 mt-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex justify-center items-center gap-4 sm:gap-6 text-sm">
            <a
              href="https://github.com/joshmu/lab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
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
            <span className="text-muted-foreground">•</span>
            <a
              href="https://joshmu.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
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