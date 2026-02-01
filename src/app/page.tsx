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
        <div className="mb-4 flex items-center gap-3">
          <Beaker className="text-primary h-8 w-8" />
          <h1 className="text-4xl font-bold tracking-tight">Lab</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-lg">
          A collection of web development experiments and explorations. Each
          experiment is a standalone page exploring different techniques,
          patterns, and ideas.
        </p>
      </header>

      {/* Experiments Grid */}
      {publishedExperiments.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground mb-4 text-lg">
            No experiments yet.
          </p>
          <p className="text-muted-foreground text-sm">
            Add your first experiment in{" "}
            <code className="bg-muted rounded px-2 py-1">src/experiments/</code>
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
              <Card className="hover:border-primary/50 h-full transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="group-hover:text-primary text-xl transition-colors">
                      {experiment.title}
                    </CardTitle>
                    <ExternalLink className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardDescription>{experiment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {experiment.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(experiment.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <footer className="border-border mt-16 border-t pt-8">
        <p className="text-muted-foreground text-sm">
          {publishedExperiments.length} experiment
          {publishedExperiments.length !== 1 ? "s" : ""} in the registry
        </p>
      </footer>
    </main>
  );
}
