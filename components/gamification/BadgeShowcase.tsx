import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Crown, Star, Zap, Heart, DollarSign, Users, Rocket, Handshake } from "lucide-react";

const BADGE_CONFIG = {
  PERFECT_CHALLENGER: {
    icon: Trophy,
    label: "Perfect Challenger",
    desc: "Completed all milestones without missing one",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
  },
  COMEBACK_KING: {
    icon: Crown,
    label: "Comeback King",
    desc: "Won after being on the edge of elimination",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
  },
  LAST_SURVIVOR: {
    icon: Zap,
    label: "Last Survivor",
    desc: "Only winner in a challenge",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
  CONSISTENCY_MASTER: {
    icon: Flame,
    label: "Consistency Master",
    desc: "Maintained a 10+ day streak",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
  },
  FIRST_WIN: {
    icon: Star,
    label: "First Win",
    desc: "Won your first challenge",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
  },
  SOCIAL_BUTTERFLY: {
    icon: Users,
    label: "Social Butterfly",
    desc: "Joined 5 or more challenges",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/30",
  },
  HIGH_ROLLER: {
    icon: DollarSign,
    label: "High Roller",
    desc: "Staked over $500 in challenges",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
  STREAK_MASTER: {
    icon: Flame,
    label: "Streak Master",
    desc: "Reached a 30-day streak",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/30",
  },
  EARLY_ADOPTER: {
    icon: Rocket,
    label: "Early Adopter",
    desc: "Joined StakeUp in the first month",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
  },
  REFERRAL_KING: {
    icon: Handshake,
    label: "Referral King",
    desc: "Invited 5 or more friends",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
  },
};

interface BadgeShowcaseProps {
  earnedBadges: string[];
  showAll?: boolean;
}

export default function BadgeShowcase({ earnedBadges, showAll = false }: BadgeShowcaseProps) {
  const badges = Object.entries(BADGE_CONFIG);
  const displayed = showAll ? badges : badges.filter(([key]) => earnedBadges.includes(key));

  if (displayed.length === 0 && !showAll) {
    return (
      <div className="text-center py-6 text-white/30 text-sm">
        No badges yet — complete challenges to earn them
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {badges.map(([key, config]) => {
        const earned = earnedBadges.includes(key);
        const Icon = config.icon;

        if (!showAll && !earned) return null;

        return (
          <div
            key={key}
            className={`p-3 rounded-xl border transition-all ${
              earned
                ? `${config.bg} ${config.border}`
                : "bg-white/3 border-white/5 opacity-30 grayscale"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${earned ? config.color : "text-white/30"}`} />
            </div>
            <div className={`text-sm font-semibold ${earned ? "text-white" : "text-white/30"}`}>
              {config.label}
            </div>
            <div className="text-xs text-white/40 mt-0.5">{config.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
