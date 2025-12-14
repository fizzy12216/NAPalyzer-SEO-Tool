export interface PlatformData {
  id: string;
  platform: string;
  name: string;
  address: string;
  phone: string;
  claimed: boolean;
}

export interface BusinessInfo {
  businessName: string;
  city: string;
  country: string;
  website: string;
}

export interface Issue {
  type: string;
  severity: "Critical" | "Needs Attention" | "Healthy";
  description: string;
}

export interface FixSuggestion {
  step: number;
  action: string;
  location: string;
}

export interface PlatformAnalysis {
  platform: string;
  normalized_data: {
    name: string;
    address: string;
    phone: string;
  };
  issues: Issue[];
  fix_suggestions: FixSuggestion[];
  status: "Critical" | "Needs Attention" | "Healthy";
}

export interface RankingFactorSuggestions {
  relevance: string[];
  proximity: string[];
  prominence: string[];
}

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

export interface OptimizedProfile {
  business_name: string;
  tagline: string;
  short_description: string;
  long_description: string;
  primary_category: string;
  target_keywords: string[];
}

export interface AnalysisResult {
  nap_consistency_score: number;
  overall_status: string;
  summary: {
    total_platforms: number;
    healthy: number;
    needs_attention: number;
    critical: number;
  };
  platform_analysis: PlatformAnalysis[];
  common_issues_detected: string[];
  local_seo_impact: {
    ranking_risk: string;
    trust_signal: string;
    map_visibility: string;
  };
  recommended_priority_actions: string[];
  grounding_urls?: string[];
  google_ranking_factors: RankingFactorSuggestions;
  competitors: Competitor[];
  optimized_profile: OptimizedProfile;
}