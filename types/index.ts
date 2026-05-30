export type {
  User,
  Challenge,
  Participant,
  Milestone,
  Submission,
  Vote,
  Dispute,
  Transaction,
  Payout,
  ChatMessage,
  Notification,
  Badge,
  AuditLog,
  ChallengeStatus,
  ParticipantStatus,
  MilestoneStatus,
  SubmissionStatus,
  VoteType,
  DisputeStatus,
  TransactionType,
  TransactionStatus,
  NotificationType,
  VerificationMethod,
  GoalType,
  BadgeType,
  UserRole,
} from "@prisma/client";

export interface ChallengeWithDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  durationMonths: number;
  stakeAmount: number;
  maxParticipants: number;
  prizePool: number;
  inviteCode: string;
  inviteLink: string;
  startsAt: Date | null;
  endsAt: Date | null;
  coverImageUrl: string | null;
  platformFeePercent: number;
  creator: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    username: string | null;
  };
  participants: ParticipantWithUser[];
  milestones: MilestoneWithSubmissions[];
  _count: {
    participants: number;
    chatMessages: number;
  };
}

export interface ParticipantWithUser {
  id: string;
  userId: string;
  status: string;
  stakeAmount: number;
  winProbability: number | null;
  joinedAt: Date | null;
  eliminatedAt: Date | null;
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    username: string | null;
    xp: number;
    level: number;
  };
}

export interface MilestoneWithSubmissions {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  deadline: Date;
  status: string;
  targetValue: number | null;
  targetUnit: string | null;
  completedCount: number;
  failedCount: number;
  submissions?: SubmissionWithDetails[];
}

export interface SubmissionWithDetails {
  id: string;
  status: string;
  proofUrls: string[];
  aiConfidence: number | null;
  aiAnalysis: string | null;
  communityApprove: number;
  communityReject: number;
  votingDeadline: Date | null;
  submittedAt: Date;
  participant: {
    user: {
      displayName: string | null;
      avatarUrl: string | null;
    };
  };
}

export interface DashboardStats {
  activeChallenges: number;
  totalEarned: number;
  totalStaked: number;
  challengesWon: number;
  winRate: number;
  currentStreak: number;
  xp: number;
  level: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  username: string | null;
  xp: number;
  level: number;
  challengesWon: number;
  totalEarned: number;
  winRate: number;
}

export interface ActivityFeedItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  userId: string;
  user: {
    displayName: string | null;
    avatarUrl: string | null;
  };
  challengeId?: string;
  challengeName?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateChallengeInput {
  name: string;
  description: string;
  goalType: string;
  verificationMethod: string;
  durationMonths: number;
  stakeAmount: number;
  maxParticipants: number;
  isPrivate?: boolean;
  customRules?: string;
  coverImageUrl?: string;
  milestones: {
    title: string;
    description: string;
    deadline: Date;
    targetValue?: number;
    targetUnit?: string;
  }[];
}
