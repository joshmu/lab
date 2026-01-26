import Link from "next/link";
import { registry } from "@/experiments/registry";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Beaker, ExternalLink } from "lucide-react";

export default function HomePage() {
  const publishedExperiments = registry.filter(
    (exp) => exp.status === "published"
  );

  return (
    <main>
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Beaker className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Lab</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A collection of web development experiments and explorations. Each
          experiment is a standalone page exploring different techniques,
          patterns, and ideas.
        </p>
      </header>

      {/* Experiments Grid */}
      {publishedExperiments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-4">
            No experiments yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Add your first experiment in{" "}
            <code className="bg-muted px-2 py-1 rounded">src/experiments/</code>
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedExperiments.map((experiment) => (
            <Link
              key={experiment.slug}
              href={`/experiments/${experiment.slug}`}
              className="group"
            >
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {experiment.title}
                    </CardTitle>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardDescription>{experiment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {experiment.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(experiment.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <footer className="mt-16 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {publishedExperiments.length} experiment
          {publishedExperiments.length !== 1 ? "s" : ""} in the registry
        </p>
      </footer>
    </main>
  );
}
