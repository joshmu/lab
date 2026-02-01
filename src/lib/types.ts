import type { ComponentType } from "react";

/**
 * Experiment metadata - defines how an experiment appears in the registry
 */
export interface ExperimentMeta {
  /** Unique identifier for the experiment (used in URL) */
  slug: string;
  /** Display title */
  title: string;
  /** Brief description of what the experiment demonstrates */
  description: string;
  /** Categorization tags for filtering */
  tags: string[];
  /** When the experiment was created */
  createdAt: string;
  /** Optional: when the experiment was last updated */
  updatedAt?: string;
  /** Whether the experiment is ready to be shown */
  status: "draft" | "published";
}

/**
 * Complete experiment definition including the component
 */
export interface Experiment {
  meta: ExperimentMeta;
  component: ComponentType;
}

/**
 * Registry entry - what gets stored in the generated registry
 */
export interface RegistryEntry {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  status: "draft" | "published";
}

/**
 * The complete registry of all experiments
 */
export type ExperimentsRegistry = RegistryEntry[];
