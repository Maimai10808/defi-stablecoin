export type HealthFactorLevel =
  | "loading"
  | "healthy"
  | "moderate"
  | "high-risk"
  | "liquidatable";

export type HealthFactorState = {
  level: HealthFactorLevel;
  label: string;
  description: string;
  progress: number;
  isSafe: boolean;
  badgeText: string;
};
