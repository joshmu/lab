import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Beaker, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-5xl">
          {/* Hero Section */}
          <div className="space-y-8 mb-16 md:mb-24">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 mb-2">
                <Beaker className="size-12 md:size-16" />
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">
                  Lab
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                A minimal experimentation space for exploring modern web development concepts, algorithms, and interactive ideas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Next.js 16</Badge>
              <Badge variant="secondary">React 19</Badge>
              <Badge variant="secondary">Tailwind v4</Badge>
              <Badge variant="outline">Lyra Theme</Badge>
            </div>
          </div>

          {/* Quick Start Section */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-3xl font-bold mb-6">
              Quick Start
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Browse Experiments</CardTitle>
                  <CardDescription>
                    Explore interactive experiments, algorithms, and tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/experiments">
                      View All Experiments
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>View Source</CardTitle>
                  <CardDescription>
                    Check out the code on GitHub
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <a href="https://github.com/joshmu/lab" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 size-4" />
                      GitHub Repository
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Philosophy Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">
              Philosophy
            </h2>

            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground">
                    This lab is focused on <strong>outcome-based experiments</strong> - interactive tools, algorithms, and concepts that teach or demonstrate something valuable, rather than purely visual effects.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Each experiment is built with modern web technologies and designed to be:
                  </p>
                  <ul className="text-muted-foreground mt-2 space-y-1">
                    <li><strong>Interactive</strong> - User input drives the experience</li>
                    <li><strong>Educational</strong> - Demonstrates concepts or techniques</li>
                    <li><strong>Minimal</strong> - Focused on the core idea</li>
                    <li><strong>Modern</strong> - Uses 2026 web standards</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t py-8 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Built by</span>
                <a
                  href="https://joshmu.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-foreground transition-colors"
                >
                  Josh Mu
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/joshmu/lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Source
                </a>
                <span>•</span>
                <a
                  href="https://github.com/joshmu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}