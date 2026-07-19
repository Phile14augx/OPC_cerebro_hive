import type React from "react";

export type WidgetType = "code" | "sql" | "prompt" | "markdown" | "ai_interview";
export type AssessmentDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

// 1. Resources (Reusable assets for widgets)
export interface Resource {
  id: string;
  type: "database_schema" | "starter_code" | "file" | "api_spec" | "image";
  name: string;
  content: string; // URL or inline content
}

// 2. Evaluation Rubrics (Configures the AI Reviewers)
export interface RubricCriteria {
  id: string;
  category: "code_quality" | "architecture" | "security" | "performance" | "communication" | "production_readiness";
  weight: number; // 0-100
  instructions: string; // Custom instructions for the AI reviewer
}

export interface EvaluationRubric {
  id: string;
  passingScore: number;
  criteria: RubricCriteria[];
}

// 3. Widget Engine Types
export interface BaseWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  required: boolean;
  timeLimitSeconds?: number;
}

export interface CodeWidget extends BaseWidget {
  type: "code";
  language: "java" | "python" | "typescript" | "go" | "rust";
  starterCodeResourceId?: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

export interface SqlWidget extends BaseWidget {
  type: "sql";
  databaseSchemaResourceId: string;
  expectedQueryData: unknown;
}

export interface PromptWidget extends BaseWidget {
  type: "prompt";
  llmModel: "gpt-4" | "claude-3-opus" | "gemini-1.5-pro";
  targetTaskDescription: string;
}

export interface MarkdownWidget extends BaseWidget {
  type: "markdown";
  content: string;
}

export type AnyWidget = CodeWidget | SqlWidget | PromptWidget | MarkdownWidget;

// 4. Widget Registry (Simulating the framework pattern)
export interface WidgetDefinition<T extends BaseWidget> {
  type: WidgetType;
  label: string;
  icon: string; // Lucide icon name
  defaultConfig: Partial<T>;
  renderPreview: (config: T) => React.ReactElement;
  renderConfig: (config: T, onChange: (newConfig: T) => void) => React.ReactElement;
  validate: (config: T) => boolean;
}

// 5. Activities & Sections
export interface Activity {
  id: string;
  title: string;
  widgets: AnyWidget[];
  rubricId?: string;
}

export interface Section {
  id: string;
  title: string;
  activities: Activity[];
}

// 6. The Master Assessment Schema (The "Compiled" Output)
export interface AssessmentSchema {
  id: string;
  version: number;
  title: string;
  description: string;
  companyId: string;
  difficulty: AssessmentDifficulty;
  estimatedTimeMinutes: number;
  tags: string[];
  
  resources: Record<string, Resource>;
  rubrics: Record<string, EvaluationRubric>;
  
  sections: Section[];
}
