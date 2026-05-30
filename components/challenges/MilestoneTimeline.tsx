import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Clock, XCircle, AlertCircle, Upload } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  status: string;
  targetValue: number | null;
  targetUnit: string | null;
  completedCount: number;
  failedCount: number;
  orderIndex: number;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  challengeId: string;
  isParticipant?: boolean;
  participantStatus?: string;
  userSubmissions?: Record<string, string>; // milestoneId -> submission status
}

const statusConfig = {
  PENDING: { icon: Circle, color: "text-white/30", bg: "bg-white/10 border-white/10", label: "Upcoming" },
  ACTIVE: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", label: "Active" },
  COMPLETED: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30", label: "Completed" },
  FAILED: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30", label: "Failed" },
  SKIPPED: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/10", label: "Skipped" },
};

export default function MilestoneTimeline({
  milestones,
  challengeId,
  isParticipant = false,
  participantStatus,
  userSubmissions = {},
}: MilestoneTimelineProps) {
  return (
    <div className="space-y-0">
      {milestones.map((milestone, index) => {
        const config = statusConfig[milestone.status as keyof typeof statusConfig] || statusConfig.PENDING;
        const StatusIcon = config.icon;
        const isLast = index === milestones.length - 1;
        const submissionStatus = userSubmissions[milestone.id];
        const canSubmit = isParticipant && participantStatus === "ACTIVE" && milestone.status === "ACTIVE" && !submissionStatus;
        const isPast = new Date(milestone.deadline) < new Date();

        return (
          <div key={milestone.id} className="flex gap-4">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${config.bg}`}>
                <StatusIcon className={`w-5 h-5 ${config.color}`} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 ${
                  milestone.status === "COMPLETED" ? "bg-emerald-400/30" : "bg-white/10"
                }`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
              <div className={`p-4 rounded-xl border transition-all ${config.bg} ${
                milestone.status === "ACTIVE" ? "ring-1 ring-yellow-400/20" : ""
              }`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white/40">Milestone {milestone.orderIndex}</span>
                      <Badge
                        variant={
                          milestone.status === "COMPLETED" ? "success" :
                          milestone.status === "FAILED" ? "destructive" :
                          milestone.status === "ACTIVE" ? "warning" :
                          "outline"
                        }
                        className="text-xs"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white">{milestone.title}</h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs ${isPast && milestone.status === "PENDING" ? "text-red-400" : "text-white/50"}`}>
                      {formatDate(milestone.deadline)}
                    </div>
                    {milestone.targetValue && (
                      <div className="text-xs text-violet-400 font-medium mt-0.5">
                        Target: {milestone.targetValue} {milestone.targetUnit}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-white/60 mb-3">{milestone.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-white/40">
                    <span className="text-emerald-400">{milestone.completedCount} completed</span>
                    {milestone.failedCount > 0 && (
                      <span className="text-red-400">{milestone.failedCount} failed</span>
                    )}
                  </div>

                  {canSubmit && (
                    <Link href={`/challenges/${challengeId}/submit?milestoneId=${milestone.id}`}>
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-xs h-8">
                        <Upload className="w-3 h-3 mr-1" />
                        Submit Proof
                      </Button>
                    </Link>
                  )}

                  {submissionStatus && (
                    <Badge
                      variant={
                        submissionStatus === "APPROVED" ? "success" :
                        submissionStatus === "REJECTED" ? "destructive" :
                        "warning"
                      }
                      className="text-xs"
                    >
                      {submissionStatus === "APPROVED" ? "✓ Submitted" :
                       submissionStatus === "REJECTED" ? "✗ Rejected" :
                       "⏳ Under Review"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
