"use client";

import { Suspense, useEffect, useState } from "react";
import {
  ExperimentExplorer,
  ExperimentExplorerSkeleton,
  ExperimentExplorerError,
} from "../components/navigation";

/**
 * Experiments page component
 */
export default function ExperimentsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Experiments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Explore interactive experiments and learn modern web development
            techniques.
          </p>
        </div>

        <Suspense fallback={<ExperimentExplorerSkeleton />}>
          <ExperimentExplorerWrapper />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Wrapper component to handle data loading
 */
function ExperimentExplorerWrapper() {
  const [navigationTree, setNavigationTree] = useState<any>(null);
  const [searchIndex, setSearchIndex] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/experiments");
        if (!response.ok) {
          throw new Error("Failed to load experiments");
        }
        const data = await response.json();
        setNavigationTree(data.navigationTree);
        setSearchIndex(data.searchIndex);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return <ExperimentExplorerSkeleton />;
  }

  if (error) {
    return (
      <ExperimentExplorerError
        error={error}
        onRetry={() => window.location.reload()}
        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
      />
    );
  }

  if (!navigationTree || !searchIndex) {
    return (
      <ExperimentExplorerError
        error="No experiments data available"
        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
      />
    );
  }

  return (
    <ExperimentExplorer
      navigationTree={navigationTree}
      searchIndex={searchIndex}
      onExperimentSelect={(experiment) => {
        console.log("Selected experiment:", experiment);
      }}
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
    />
  );
}
