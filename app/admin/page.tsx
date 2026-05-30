import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users, Trophy, DollarSign, AlertTriangle, TrendingUp,
  Shield, Clock, CheckCircle, XCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

async function getAdminUser(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });
}

async function getAdminStats() {
  const [
    totalUsers,
    totalChallenges,
    activeChallenges,
    totalRevenue,
    openDisputes,
    pendingSubmissions,
    recentUsers,
    recentChallenges,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.challenge.count(),
    prisma.challenge.count({ where: { status: "ACTIVE" } }),
    prisma.transaction.aggregate({
      where: { type: "FEE", status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.submission.count({ where: { status: { in: ["AI_REVIEWING", "COMMUNITY_VOTING"] } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, displayName: true, avatarUrl: true, email: true, createdAt: true, role: true, isBanned: true },
    }),
    prisma.challenge.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        creator: { select: { displayName: true } },
        _count: { select: { participants: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalChallenges,
    activeChallenges,
    totalRevenue: totalRevenue._sum.amount || 0,
    openDisputes,
    pendingSubmissions,
    recentUsers,
    recentChallenges,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const adminUser = await getAdminUser(clerkId);
  if (!adminUser || adminUser.role !== "ADMIN") redirect("/dashboard");

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-[#303D31] py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-[#91C687]" />
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/50 text-sm">Platform overview and management</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Users", value: stats.totalUsers.toLocaleString(), color: "text-blue-400", bg: "bg-blue-600/10" },
            { icon: Trophy, label: "Total Challenges", value: stats.totalChallenges.toLocaleString(), color: "text-[#91C687]", bg: "bg-[#91C687]/10" },
            { icon: DollarSign, label: "Platform Revenue", value: formatCurrency(stats.totalRevenue), color: "text-emerald-400", bg: "bg-emerald-600/10" },
            { icon: TrendingUp, label: "Active Challenges", value: stats.activeChallenges.toLocaleString(), color: "text-yellow-400", bg: "bg-yellow-600/10" },
          ].map((stat) => (
            <Card key={stat.label} className="border-white/10 bg-white/5">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className={`border-${stats.openDisputes > 0 ? "red" : "white"}-500/30 bg-white/5`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.openDisputes}</div>
                <div className="text-sm text-white/60">Open Disputes</div>
              </div>
              {stats.openDisputes > 0 && (
                <Badge variant="destructive" className="ml-auto">Needs Review</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-600/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.pendingSubmissions}</div>
                <div className="text-sm text-white/60">Pending Submissions</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-4 h-4 text-[#91C687]" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-4">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatarUrl ?? ""} />
                      <AvatarFallback>{user.displayName?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{user.displayName || "Anonymous"}</div>
                      <div className="text-xs text-white/40 truncate">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.role === "ADMIN" && <Badge variant="default">Admin</Badge>}
                      {user.isBanned ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Challenges */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-4 h-4 text-[#91C687]" />
                Recent Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {stats.recentChallenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-center gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{challenge.name}</div>
                      <div className="text-xs text-white/40">
                        by {challenge.creator.displayName} · {challenge._count.participants} participants
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          challenge.status === "ACTIVE"
                            ? "success"
                            : challenge.status === "COMPLETED"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {challenge.status}
                      </Badge>
                      <span className="text-xs text-emerald-400 font-semibold">
                        {formatCurrency(challenge.prizePool)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
