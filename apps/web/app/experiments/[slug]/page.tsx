import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Github } from 'lucide-react';

// This will be replaced with actual experiment imports
const experimentComponents: Record<string, any> = {
  // 'maze-generator': MazeGenerator,
  // 'game-of-life': GameOfLife,
};

// This will be replaced with database/file-based system
const experimentMetadata: Record<string, {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  sourceUrl?: string;
}> = {
  'maze-generator': {
    title: 'Maze Generator & Solver',
    description: 'Generate random mazes with recursive backtracking and solve them with A* pathfinding algorithm',
    category: 'algorithms',
    difficulty: 'advanced',
    tags: ['pathfinding', 'algorithms', 'visualization'],
    sourceUrl: 'https://github.com/joshmu/lab/tree/main/apps/web/app/experiments/maze-generator',
  },
};

export async function generateStaticParams() {
  return Object.keys(experimentMetadata).map((slug) => ({
    slug,
  }));
}

export default function ExperimentPage({
  params,
}: {
  params: { slug: string };
}) {
  const metadata = experimentMetadata[params.slug];
  const ExperimentComponent = experimentComponents[params.slug];

  if (!metadata) {
    notFound();
  }

  // If component doesn't exist yet, show coming soon
  if (!ExperimentComponent) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/experiments">
              <ArrowLeft className="mr-2 size-4" />
              Back to Experiments
            </Link>
          </Button>

          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">{metadata.title}</h1>
            <p className="text-muted-foreground mb-8">{metadata.description}</p>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/experiments">
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{metadata.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {metadata.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {metadata.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {metadata.sourceUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={metadata.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 size-4" />
                  Source
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Experiment Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <ExperimentComponent />
      </div>
    </div>
  );
}
