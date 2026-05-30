import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getDisputes() {
  return prisma.dispute.findMany({
    where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    include: {
      submission: {
        include: {
          milestone: true,
          participant: {
            include: {
              user: { select: { displayName: true, avatarUrl: true } },
              challenge: { select: { id: true, name: true } },
            },
          },
        },
      },
      raisedBy: { select: { displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export const dynamic = "force-dynamic";

export default async function DisputesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const disputes = await getDisputes();

  return (
    <div className="min-h-screen bg-[#080810] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="w-7 h-7 text-red-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Dispute Resolution</h1>
            <p className="text-white/50 text-sm">{disputes.length} open disputes requiring review</p>
          </div>
        </div>

        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="border-red-500/20 bg-white/5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-base">
                      Dispute in: {dispute.submission.participant.challenge.name}
                    </CardTitle>
                    <p className="text-sm text-white/50 mt-1">
                      Milestone: {dispute.submission.milestone.title}
                    </p>
                  </div>
                  <Badge
                    variant={dispute.status === "OPEN" ? "destructive" : "warning"}
                  >
                    {dispute.status === "OPEN" ? (
                      <><Clock className="w-3 h-3 mr-1" />Open</>
                    ) : (
                      <><AlertTriangle className="w-3 h-3 mr-1" />Under Review</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-white/40 mb-1">Submitted by</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={dispute.submission.participant.user.avatarUrl ?? ""} />
                        <AvatarFallback className="text-xs">{dispute.submission.participant.user.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white">{dispute.submission.participant.user.displayName}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Dispute raised by</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={dispute.raisedBy.avatarUrl ?? ""} />
                        <AvatarFallback className="text-xs">{dispute.raisedBy.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white">{dispute.raisedBy.displayName}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/40 mb-1">Reason</div>
                  <p className="text-sm text-white">{dispute.reason}</p>
                </div>

                {dispute.submission.proofUrls.length > 0 && (
                  <div>
                    <div className="text-xs text-white/40 mb-2">Proof Files</div>
                    <div className="flex gap-2 flex-wrap">
                      {dispute.submission.proofUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-400 hover:text-violet-300 underline"
                        >
                          Proof {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs text-white/40">
                    AI Confidence: {dispute.submission.aiConfidence ?? "N/A"}%
                    · Votes: {dispute.submission.communityApprove}✓ / {dispute.submission.communityReject}✗
                    · Opened: {formatDate(dispute.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-colors">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Approve
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {disputes.length === 0 && (
            <div className="text-center py-16 text-white/40">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
              <p className="text-lg font-medium text-white/60">All clear!</p>
              <p>No open disputes at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
