export interface ParsedQuestion {
  content: string;
  type:
    | "single_choice"
    | "multiple_choice"
    | "true_false"
    | "fill_blank"
    | "essay";
  options?: Array<{ key: string; value: string; isCorrect: boolean }>;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  score: number;
  explanation?: string;
  subjectName?: string;
  tags?: string[];
  [key: string]: any;
}

export interface ImportConfig {
  importMode: "overwrite" | "skip" | "rename";
  defaultSubjectId: number;
  defaultDifficulty: "easy" | "medium" | "hard";
  defaultTags: string;
}

export interface ImportProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}