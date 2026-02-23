// Production system status mappings
export const MatchStatus = {
  MATCH_CREATED: 1,
  VIDEO_UPLOADED: 2,
  ANALYSIS_DONE: 3,
  RESOURCES_ASSIGNED: 4,
  ANALYSIS_IN_PROGRESS: 5,
  REVIEW_IN_PROGRESS: 6,
  COMPLETED: 7,
  MARK_FOR_REVIEW: 8,
  ISSUE_FOUND: 9,
} as const;

export type MatchStatusValue = typeof MatchStatus[keyof typeof MatchStatus];

// Map status numbers to display names
export const MatchStatusLabels: Record<number, string> = {
  [MatchStatus.MATCH_CREATED]: "Created",
  [MatchStatus.VIDEO_UPLOADED]: "Video Uploaded",
  [MatchStatus.ANALYSIS_DONE]: "Analysis Done",
  [MatchStatus.RESOURCES_ASSIGNED]: "Resources Assigned",
  [MatchStatus.ANALYSIS_IN_PROGRESS]: "Analysis in Progress",
  [MatchStatus.REVIEW_IN_PROGRESS]: "Review in Progress",
  [MatchStatus.COMPLETED]: "Completed",
  [MatchStatus.MARK_FOR_REVIEW]: "Mark for Review",
  [MatchStatus.ISSUE_FOUND]: "Issue Found",
};

// Map old string statuses to new numeric statuses for backward compatibility
export const StatusStringToNumber: Record<string, number> = {
  created: MatchStatus.MATCH_CREATED,
  video_uploaded: MatchStatus.VIDEO_UPLOADED,
  analysis_done: MatchStatus.ANALYSIS_DONE,
  resources_assigned: MatchStatus.RESOURCES_ASSIGNED,
  analysis_in_progress: MatchStatus.ANALYSIS_IN_PROGRESS,
  in_review: MatchStatus.REVIEW_IN_PROGRESS,
  completed: MatchStatus.COMPLETED,
  mark_for_review: MatchStatus.MARK_FOR_REVIEW,
  rework: MatchStatus.ISSUE_FOUND,
  issue_found: MatchStatus.ISSUE_FOUND,
};

// Creator types for matches
export enum CreatorType {
  CLIENT = "Created by Client",
  BUSINESS_TEAM = "Created by B.T",
  MANAGER = "Created",
}

// Get status badge styling based on status number
export function getStatusStyle(status: number): string {
  switch (status) {
    case MatchStatus.COMPLETED:
      return "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30";
    case MatchStatus.REVIEW_IN_PROGRESS:
    case MatchStatus.MARK_FOR_REVIEW:
      return "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30";
    case MatchStatus.ISSUE_FOUND:
      return "bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30";
    case MatchStatus.ANALYSIS_IN_PROGRESS:
    case MatchStatus.ANALYSIS_DONE:
      return "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30";
    default:
      return "bg-[#6b7280]/15 text-[#9ca3af] border-[#6b7280]/30";
  }
}
