export interface InterviewerProfile {
  title: string;
  primaryFocus: string;
  evaluates: string[];
  redFlags: string[];
  winningMindset: string;
}

export interface StarGuide {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor' | 'Uzman' | string;
  question: string;
  whyTheyAsk: string;
  evaluationCriteria: string[];
  starGuide: StarGuide;
  sampleStrongAnswer: string;
  commonPitfalls: string[];
}

export interface CandidateQuestionToAsk {
  question: string;
  whyItImpresses: string;
}

export interface InterviewGenerationResponse {
  interviewerProfile: InterviewerProfile;
  questions: InterviewQuestion[];
  candidateQuestionsToAsk: CandidateQuestionToAsk[];
}

export interface AnswerEvaluation {
  score: number;
  verdict: string;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  interviewerImpression: string;
  improvedVersion: string;
  quickTips: string[];
}

export interface TrainingItem {
  id: string;
  title: string;
  provider: string;
  contentSummary: string;
  durationOrYear: string;
  skillsLearned: string[];
}

export interface NextTrainingRecommendation {
  id: string;
  title: string;
  priority: string;
  whyThisNext: string;
  targetCurriculumModules: string[];
  expectedSkillsGained: string[];
  suggestedPlatformsOrCertifications: string[];
  estimatedDuration: string;
}

export interface PortfolioProject {
  title: string;
  concept: string;
  techStackOrTools: string[];
  deliverables: string[];
  whyItImpressesRecruiters: string;
}

export interface RoadmapMilestone {
  milestone: string;
  actions: string[];
}

export interface CareerAnalysisResponse {
  executiveSummary: string;
  currentLevelAssessment: string;
  competencyBreakdown: {
    masteredSkills: string[];
    criticalGaps: string[];
    redundanciesOrOverlaps?: string[];
  };
  nextTrainingRecommendations: NextTrainingRecommendation[];
  portfolioProject: PortfolioProject;
  roadmap: {
    month1: RoadmapMilestone;
    month2: RoadmapMilestone;
    month3: RoadmapMilestone;
  };
}
