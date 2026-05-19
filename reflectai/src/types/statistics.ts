export interface StatisticsEvolutionPoint {
  id: string;
  label: string;
  intensity: number;
}

export interface StatisticsEmotionItem {
  id: string;
  label: string;
  percentage: number;
  colorHex: string;
}

export interface StatisticsTopicItem {
  id: string;
  label: string;
  sessionCount: number;
}

export interface StatisticsPattern {
  title: string;
  description: string;
}

export interface StatisticsSessionOption {
  id: string;
  label: string;
  intensity: number;
  emotion: string;
}

export interface StatisticsComparisonSelection {
  sessionA: string;
  sessionB: string;
}

export interface StatisticsComparisonResult {
  sessionAIntensity: number;
  sessionBIntensity: number;
  sessionALabel: string;
  sessionBLabel: string;
  insight: string;
}

export interface StatisticsDashboardData {
  evolution: StatisticsEvolutionPoint[];
  emotions: StatisticsEmotionItem[];
  topics: StatisticsTopicItem[];
  pattern: StatisticsPattern;
  sessionOptions: StatisticsSessionOption[];
  defaultSelection: StatisticsComparisonSelection;
}
