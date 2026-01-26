import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { registry, experiments } from "@/experiments/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, RefreshCw } from "lucide-react";

interface ExperimentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return registry
    .filter((exp) => exp.status === "published")
    .map((exp) => ({ slug: exp.slug }));
}

export async function generateMetadata(props: ExperimentPageProps) {
  const params = await props.params;
  const experiment = registry.find((exp) => exp.slug === params.slug);

  if (!experiment) {
    return { title: "Experiment Not Found" };
  }

  return {
    title: `${experiment.title} | Lab`,
    description: experiment.description,
  };
}

async function ExperimentContent({ slug }: { slug: string }) {
  const experimentLoader = experiments[slug];

  if (!experimentLoader) {
    notFound();
  }

  const { default: ExperimentComponent } = await experimentLoader();

  return <ExperimentComponent />;
}

export default async function ExperimentPage(props: ExperimentPageProps) {
  const params = await props.params;
  const experiment = registry.find((exp) => exp.slug === params.slug);

  if (!experiment || experiment.status !== "published") {
    notFound();
  }

  return (
    <div>
      {/* Back Navigation */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Registry
          </Link>
        </Button>
      </div>

      {/* Experiment Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold mb-3">{experiment.title}</h1>
        <p className="text-muted-foreground mb-4">{experiment.description}</p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {experiment.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(experiment.createdAt)}
            </span>
            {experiment.updatedAt && (
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                Updated {formatDate(experiment.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Experiment Content */}
      <div className="min-h-[400px]">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">
                Loading experiment...
              </div>
            </div>
          }
        >
          <ExperimentContent slug={params.slug} />
        </Suspense>
      </div>
    </div>
  );
}
