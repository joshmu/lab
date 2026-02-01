import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

// Temporary: Will be replaced with database/file-based system
const experiments = [
  {
    id: 'maze-generator',
    title: 'Maze Generator & Solver',
    description: 'Generate random mazes with recursive backtracking and solve them with A* pathfinding algorithm',
    category: 'algorithms',
    difficulty: 'advanced',
    tags: ['pathfinding', 'algorithms', 'visualization'],
    status: 'planned' as const,
  },
  {
    id: 'game-of-life',
    title: 'Conway\'s Game of Life',
    description: 'Cellular automaton simulation with customizable rules and patterns',
    category: 'simulation',
    difficulty: 'intermediate',
    tags: ['simulation', 'cellular-automaton', 'patterns'],
    status: 'planned' as const,
  },
  {
    id: 'sorting-visualizer',
    title: 'Sorting Algorithm Visualizer',
    description: 'Visualize common sorting algorithms (Quick, Merge, Bubble, etc.) step by step',
    category: 'algorithms',
    difficulty: 'intermediate',
    tags: ['algorithms', 'visualization', 'education'],
    status: 'planned' as const,
  },
];

export default function ExperimentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Experiments
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Interactive experiments exploring algorithms, simulations, and web development concepts.
          </p>
        </div>

        {/* Experiments Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {experiments.map((experiment) => (
            <Card key={experiment.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <CardTitle className="text-xl">{experiment.title}</CardTitle>
                  <Badge
                    variant={
                      experiment.status === 'live' ? 'default' :
                      experiment.status === 'draft' ? 'secondary' :
                      'outline'
                    }
                  >
                    {experiment.status}
                  </Badge>
                </div>
                <CardDescription>{experiment.description}</CardDescription>
              </CardHeader>

              <CardContent className="mt-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {experiment.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {experiment.difficulty}
                  </Badge>
                  {experiment.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {experiment.status === 'live' ? (
                  <Button asChild className="w-full">
                    <Link href={`/experiments/${experiment.id}`}>
                      Open Experiment
                      <ExternalLink className="ml-2 size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {experiments.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No experiments available yet. Check back soon!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

