"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { voteOnSubmission } from "@/lib/actions/submissions";
import { CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import Image from "next/image";

interface VotingCardProps {
  submission: {
    id: string;
    proofUrls: string[];
    aiConfidence: number | null;
    aiAnalysis: string | null;
    communityApprove: number;
    communityReject: number;
    votingDeadline: Date | null;
    notes?: string | null;
    participant: {
      user: { displayName: string | null; avatarUrl: string | null };
    };
    milestone: { title: string; description: string };
  };
  onVoted?: () => void;
}

export default function VotingCard({ submission, onVoted }: VotingCardProps) {
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);

  const totalVotes = submission.communityApprove + submission.communityReject;
  const approvePercent = totalVotes > 0 ? (submission.communityApprove / totalVotes) * 100 : 50;

  const handleVote = async (type: "APPROVE" | "REJECT") => {
    setVoting(true);
    try {
      const result = await voteOnSubmission(submission.id, type);
      setVoted(true);
      toast.success(type === "APPROVE" ? "Vote cast: Approved ✓" : "Vote cast: Rejected ✗");
      onVoted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setVoting(false);
    }
  };

  return (
    <Card className="border-yellow-500/20 bg-white/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-white">
                {submission.participant.user.displayName || "Anonymous"}
              </span>
              <Badge variant="warning" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Needs Vote
              </Badge>
            </div>
            <p className="text-xs text-white/50">
              Milestone: {submission.milestone.title}
              {submission.votingDeadline && (
                <span className="ml-2">· Deadline: {formatRelativeTime(submission.votingDeadline)}</span>
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Proof Images */}
        {submission.proofUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {submission.proofUrls.slice(0, 4).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  <Image
                    src={url}
                    alt={`Proof ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Notes */}
        {submission.notes && (
          <p className="text-sm text-white/60 italic">"{submission.notes}"</p>
        )}

        {/* AI Analysis */}
        {submission.aiConfidence !== null && (
          <div className="p-3 rounded-lg bg-[#91C687]/10 border border-[#91C687]/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/50">AI Confidence</span>
              <span className={`text-sm font-bold ${
                (submission.aiConfidence ?? 0) >= 60 ? "text-emerald-400" :
                (submission.aiConfidence ?? 0) >= 40 ? "text-yellow-400" : "text-red-400"
              }`}>
                {submission.aiConfidence}%
              </span>
            </div>
            <Progress value={submission.aiConfidence} className="h-1.5 mb-2" />
            {submission.aiAnalysis && (
              <p className="text-xs text-white/50">{submission.aiAnalysis}</p>
            )}
          </div>
        )}

        {/* Current Votes */}
        {totalVotes > 0 && (
          <div>
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span className="text-emerald-400">{submission.communityApprove} approve</span>
              <span className="text-red-400">{submission.communityReject} reject</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-red-500/30">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${approvePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Vote Buttons */}
        {!voted ? (
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-500"
              onClick={() => handleVote("APPROVE")}
              disabled={voting}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleVote("REJECT")}
              disabled={voting}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-white/50">
            <CheckCircle className="w-4 h-4 inline mr-1 text-emerald-400" />
            Vote submitted
          </div>
        )}
      </CardContent>
    </Card>
  );
}
